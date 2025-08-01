import { Migration } from '@mikro-orm/migrations';

export class Migration20250728124134 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "invoice_config" add column if not exists "notes" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "invoice_config" drop column if exists "notes";`);
  }

}
