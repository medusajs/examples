import { useState } from "react"
import { Input, Button, Select, toast } from "@medusajs/ui"
import { MediaType } from "../../types"

type CreateMedia = {
  type: MediaType
  file?: File
}

type Props = {
  onSuccess?: () => void
}

const CreateDigitalProductForm = ({
  onSuccess
}: Props) => {
  const [name, setName] = useState("")
  const [medias, setMedias] = useState<CreateMedia[]>([])
  const [productTitle, setProductTitle] = useState("")
  const [loading, setLoading] = useState(false)

  const onAddMedia = () => {
    setMedias((prev) => [
      ...prev,
      {
        type: MediaType.PREVIEW,
      }
    ])
  }

  const changeFiles = (
    index: number,
    data: Partial<CreateMedia>
  ) => {
    setMedias((prev) => [
      ...(prev.slice(0, index)),
      {
        ...prev[index],
        ...data
      },
      ...(prev.slice(index + 1))
    ])
  }

  const uploadMediaFiles = async (
    type: MediaType
  ) => {
    const formData = new FormData()
    const mediaWithFiles = medias.filter(
      (media) => media.file !== undefined && 
        media.type === type
    )

    if (!mediaWithFiles.length) {
      return
    }

    mediaWithFiles.forEach((media) => {
      formData.append("files", media.file)
    })

    const { files } = await fetch(`/admin/digital-products/upload/${type}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    }).then((res) => res.json())

    return {
      mediaWithFiles,
      files
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        mediaWithFiles: previewMedias,
        files: previewFiles
      } = await uploadMediaFiles(MediaType.PREVIEW) || {}
      const {
        mediaWithFiles: mainMedias,
        files: mainFiles
      } = await uploadMediaFiles(MediaType.MAIN) || {}
  
      const mediaData = []
  
      previewMedias?.forEach((media, index) => {
        mediaData.push({
          type: media.type,
          file_id: previewFiles[index].id,
          mime_type: media.file!.type,
        })
      })
  
      mainMedias?.forEach((media, index) => {
        mediaData.push({
          type: media.type,
          file_id: mainFiles[index].id,
          mime_type: media.file!.type,
        })
      })
  
      fetch(`/admin/digital-products`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          medias: mediaData,
          product: {
            title: productTitle,
            options: [{
              title: "Default",
              values: ["default"]
            }],
            variants: [{
              title: productTitle,
              options: {
                Default: "default"
              },
              // delegate setting the prices to the
              // product's page.
              prices: []
            }]
          }
        })
      })
      .then((res) => res.json())
      .then(({ message }) => {
        if (message) {
          throw message
        }
        onSuccess?.()
      })
      .catch((e) => {
        console.error(e)
        toast.error("Error", {
          description: `An error occurred while creating the digital product: ${e}`
        })
      })
      .finally(() => setLoading(false))
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Input
        name="name"
        placeholder="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <fieldset className="my-4">
        <legend className="mb-2">Media</legend>
        <Button type="button" onClick={onAddMedia}>Add Media</Button>
        {medias.map((media, index) => (
          <fieldset className="my-2 p-2 border-solid border rounded">
            <legend>Media {index + 1}</legend>
            <Select 
              value={media.type} 
              onValueChange={(value) => changeFiles(
                index,
                {
                  type: value as MediaType
                }
              )}
            >
              <Select.Trigger>
                <Select.Value placeholder="Media Type" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value={MediaType.PREVIEW}>
                  Preview
                </Select.Item>
                <Select.Item value={MediaType.MAIN}>
                  Main
                </Select.Item>
              </Select.Content>
            </Select>
            <Input
              name={`file-${index}`}
              type="file"
              onChange={(e) => changeFiles(
                index,
                {
                  file: e.target.files[0]
                }
              )}
              className="mt-2"
            />
          </fieldset>
        ))}
      </fieldset>
      <fieldset className="my-4">
        <legend className="mb-2">Product</legend>
        <Input
          name="product_title"
          placeholder="Product Title"
          type="text"
          value={productTitle}
          onChange={(e) => setProductTitle(e.target.value)}
        />
      </fieldset>
      <Button 
        type="submit"
        isLoading={loading}
      >
        Create
      </Button>
    </form>
  )
}

export default CreateDigitalProductForm