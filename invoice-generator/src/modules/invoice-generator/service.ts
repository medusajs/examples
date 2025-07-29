import { MedusaService } from "@medusajs/framework/utils"
import { InvoiceConfig } from "./models/invoice-config";
import { Invoice, InvoiceStatus } from "./models/invoice";
import PdfPrinter from "pdfmake"
import { InferTypeOf, OrderDTO, OrderLineItemDTO } from "@medusajs/framework/types"
import axios from "axios"

const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  },
}

const printer = new PdfPrinter(fonts)

type GeneratePdfParams = {
  order: OrderDTO
  items: OrderLineItemDTO[]
}

class InvoiceGeneratorService extends MedusaService({
  InvoiceConfig,
  Invoice
}) {
  async generatePdf(params: GeneratePdfParams & {
    invoice_id: string
  }): Promise<Buffer> {
    const invoice = await this.retrieveInvoice(params.invoice_id)

    // Generate new content
    const pdfContent = Object.keys(invoice.pdfContent).length ? 
      invoice.pdfContent : 
      await this.createInvoiceContent(params, invoice)

    await this.updateInvoices({
      id: invoice.id,
      pdfContent
    })

    // get PDF as a Buffer
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
  
      const pdfDoc = printer.createPdfKitDocument(pdfContent as any)
      
      pdfDoc.on('data', chunk => chunks.push(chunk));
      pdfDoc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });
      pdfDoc.on('error', err => reject(err));
  
      pdfDoc.end(); // Finalize PDF stream
    });
  }

  private async createInvoiceContent(
    params: GeneratePdfParams, 
    invoice: InferTypeOf<typeof Invoice>
  ): Promise<Record<string, any>> {
    // Get invoice configuration
    const invoiceConfigs = await this.listInvoiceConfigs()
    const config = invoiceConfigs[0] || {}

    // Create table for order items
    const itemsTable = [
      [
        { text: 'Item', style: 'tableHeader' },
        { text: 'Quantity', style: 'tableHeader' },
        { text: 'Unit Price', style: 'tableHeader' },
        { text: 'Total', style: 'tableHeader' }
      ],
      ...(await Promise.all(params.items.map(async item => [
        { text: item.title || 'Unknown Item', style: 'tableRow' },
        { text: item.quantity.toString(), style: 'tableRow' },
        { text: await this.formatAmount(
          item.unit_price, 
          params.order.currency_code
        ), style: 'tableRow' },
        { text: await this.formatAmount(
          Number(item.total), 
          params.order.currency_code
        ), style: 'tableRow' }
      ])))
    ]

    const invoiceId = `INV-${invoice.display_id.toString().padStart(6, '0')}`
    const invoiceDate = new Date(invoice.created_at).toLocaleDateString()

    // return the PDF content structure
    return {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      header: {
        margin: [40, 20, 40, 0],
        columns: [
          /** Company Logo */
          {
            width: '*',
            stack: [
              ...(config.company_logo ? [
                {
                  image: await this.imageUrlToBase64(config.company_logo),
                  width: 80,
                  height: 40,
                  fit: [80, 40],
                  margin: [0, 0, 0, 10]
                }
              ] : []),
              {
                text: config.company_name || 'Your Company Name',
                style: 'companyName',
                margin: [0, 0, 0, 0]
              }
            ]
          },
          /** Invoice Title */
          {
            width: 'auto',
            stack: [
              {
                text: 'INVOICE',
                style: 'invoiceTitle',
                alignment: 'right',
                margin: [0, 0, 0, 0]
              }
            ]
          }
        ]
      },
      content: [
        {
          margin: [0, 20, 0, 0],
          columns: [
            /** Company Details */
            {
              width: '*',
              stack: [
                {
                  text: 'COMPANY DETAILS',
                  style: 'sectionHeader',
                  margin: [0, 0, 0, 8]
                },
                config.company_address && {
                  text: config.company_address,
                  style: 'companyAddress',
                  margin: [0, 0, 0, 4]
                },
                config.company_phone && {
                  text: config.company_phone,
                  style: 'companyContact',
                  margin: [0, 0, 0, 4]
                },
                config.company_email && {
                  text: config.company_email,
                  style: 'companyContact',
                  margin: [0, 0, 0, 0]
                }
              ]
            },
            /** Invoice Details */
            {
              width: 'auto',
              table: {
                widths: [80, 120],
                body: [
                  [
                    { text: 'Invoice ID:', style: 'label' },
                    { text: invoiceId, style: 'value' }
                  ],
                  [
                    { text: 'Invoice Date:', style: 'label' },
                    { text: invoiceDate, style: 'value' }
                  ],
                  [
                    { text: 'Order ID:', style: 'label' },
                    { 
                      text: params.order.display_id.toString().padStart(6, '0'), 
                      style: 'value'
                    }
                  ],
                  [
                    { text: 'Order Date:', style: 'label' },
                    { 
                      text: new Date(params.order.created_at).toLocaleDateString(), 
                      style: 'value'
                    }
                  ]
                ]
              },
              layout: 'noBorders',
              margin: [0, 0, 0, 20]
            }
          ]
        },
        {
          text: '\n'
        },
        /** Billing and Shipping Addresses */
        {
          columns: [
            {
              width: '*',
              stack: [
                {
                  text: 'BILL TO',
                  style: 'sectionHeader',
                  margin: [0, 0, 0, 8]
                },
                {
                  text: params.order.billing_address ? 
                    `${params.order.billing_address.first_name || ''} ${params.order.billing_address.last_name || ''}
                    ${params.order.billing_address.address_1 || ''}${params.order.billing_address.address_2 ? `\n${params.order.billing_address.address_2}` : ''}
                    ${params.order.billing_address.city || ''}, ${params.order.billing_address.province || ''} ${params.order.billing_address.postal_code || ''}
                    ${params.order.billing_address.country_code || ''}${params.order.billing_address.phone ? `\n${params.order.billing_address.phone}` : ''}` : 
                    'No billing address provided',
                  style: 'addressText'
                }
              ]
            },
            {
              width: '*',
              stack: [
                {
                  text: 'SHIP TO',
                  style: 'sectionHeader',
                  margin: [0, 0, 0, 8]
                },
                {
                  text: params.order.shipping_address ? 
                    `${params.order.shipping_address.first_name || ''} ${params.order.shipping_address.last_name || ''}
                    ${params.order.shipping_address.address_1 || ''} ${params.order.shipping_address.address_2 ? `\n${params.order.shipping_address.address_2}` : ''}
                    ${params.order.shipping_address.city || ''}, ${params.order.shipping_address.province || ''} ${params.order.shipping_address.postal_code || ''}
                    ${params.order.shipping_address.country_code || ''}${params.order.shipping_address.phone ? `\n${params.order.shipping_address.phone}` : ''}` : 
                    'No shipping address provided',
                  style: 'addressText'
                }
              ]
            }
          ]
        },
        {
          text: '\n\n'
        },
        /** Items Table */
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: itemsTable
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return (rowIndex === 0) ? '#f8f9fa' : null;
            },
            hLineWidth: function (i: number, node: any) {
              return (i === 0 || i === node.table.body.length) ? 0.8 : 0.3;
            },
            vLineWidth: function (i: number, node: any) {
              return 0.3;
            },
            hLineColor: function (i: number, node: any) {
              return (i === 0 || i === node.table.body.length) ? '#cbd5e0' : '#e2e8f0';
            },
            vLineColor: function () {
              return '#e2e8f0';
            },
            paddingLeft: function () {
              return 8;
            },
            paddingRight: function () {
              return 8;
            },
            paddingTop: function () {
              return 6;
            },
            paddingBottom: function () {
              return 6;
            }
          }
        },
        {
          text: '\n'
        },
        /** Totals Section */
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                widths: ['auto', 'auto'],
                body: [
                  [
                    { text: 'Subtotal:', style: 'totalLabel' },
                    { 
                      text: await this.formatAmount(
                        Number(params.order.subtotal), 
                        params.order.currency_code), 
                      style: 'totalValue'
                    }
                  ],
                  [
                    { text: 'Tax:', style: 'totalLabel' },
                    { 
                      text: await this.formatAmount(
                        Number(params.order.tax_total), 
                        params.order.currency_code), 
                      style: 'totalValue'
                    }
                  ],
                  [
                    { text: 'Shipping:', style: 'totalLabel' },
                    { 
                      text: await this.formatAmount(
                        Number(params.order.shipping_methods?.[0]?.total || 0), 
                        params.order.currency_code), 
                      style: 'totalValue'
                    }
                  ],
                  [
                    { text: 'Discount:', style: 'totalLabel' },
                    { 
                      text: await this.formatAmount(
                        Number(params.order.discount_total), 
                        params.order.currency_code), 
                      style: 'totalValue'
                    }
                  ],
                  [
                    { text: 'Total:', style: 'totalLabel' },
                    { 
                      text: await this.formatAmount(
                        Number(params.order.total), 
                        params.order.currency_code), 
                      style: 'totalValue'
                    }
                  ]
                ]
              },
              layout: {
                fillColor: function (rowIndex: number) {
                  return (rowIndex === 3) ? '#f8f9fa' : null;
                },
                hLineWidth: function (i: number, node: any) {
                  return (i === 0 || i === node.table.body.length) ? 0.8 : 0.3;
                },
                vLineWidth: function () {
                  return 0.3;
                },
                hLineColor: function (i: number, node: any) {
                  return (i === 0 || i === node.table.body.length) ? '#cbd5e0' : '#e2e8f0';
                },
                vLineColor: function () {
                  return '#e2e8f0';
                },
                paddingLeft: function () {
                  return 8;
                },
                paddingRight: function () {
                  return 8;
                },
                paddingTop: function () {
                  return 6;
                },
                paddingBottom: function () {
                  return 6;
                }
              }
            }
          ]
        },
        {
          text: '\n\n'
        },
        /** Notes Section */
        ...(config.notes ? [
          {
            text: 'Notes',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10]
          },
          {
            text: config.notes,
            style: 'notesText',
            margin: [0, 0, 0, 20]
          }
        ] : []),
        {
          text: 'Thank you for your business!',
          style: 'thankYouText',
          alignment: 'center',
          margin: [0, 30, 0, 0]
        }
      ],
      styles: {
        companyName: {
          fontSize: 22,
          bold: true,
          color: '#1a365d',
          margin: [0, 0, 0, 5]
        },
        companyAddress: {
          fontSize: 11,
          color: '#4a5568',
          lineHeight: 1.3
        },
        companyContact: {
          fontSize: 10,
          color: '#4a5568'
        },
        invoiceTitle: {
          fontSize: 24,
          bold: true,
          color: '#2c3e50'
        },
        label: {
          fontSize: 10,
          color: '#6c757d',
          margin: [0, 0, 8, 0]
        },
        value: {
          fontSize: 10,
          bold: true,
          color: '#2c3e50'
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          color: '#2c3e50',
          backgroundColor: '#f8f9fa',
          padding: [8, 12]
        },
        addressText: {
          fontSize: 10,
          color: '#495057',
          lineHeight: 1.3
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          color: '#ffffff',
          fillColor: '#495057'
        },
        tableRow: {
          fontSize: 9,
          color: '#495057'
        },
        totalLabel: {
          fontSize: 10,
          bold: true,
          color: '#495057'
        },
        totalValue: {
          fontSize: 10,
          bold: true,
          color: '#2c3e50'
        },
        notesText: {
          fontSize: 10,
          color: '#6c757d',
          italics: true,
          lineHeight: 1.4
        },
        thankYouText: {
          fontSize: 12,
          color: '#28a745',
          italics: true
        }
      },
      defaultStyle: {
        font: 'Helvetica'
      }
    }
  }

  private async formatAmount(amount: number, currency: string): Promise<string> {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  private async imageUrlToBase64(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const base64 = Buffer.from(response.data).toString('base64')
    const mimeType = response.headers['content-type'] || 'image/png'
    return `data:${mimeType};base64,${base64}`
  }
}

export default InvoiceGeneratorService