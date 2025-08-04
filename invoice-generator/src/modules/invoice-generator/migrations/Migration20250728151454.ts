import { Migration } from '@mikro-orm/migrations';

export class Migration20250728151454 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "invoice" add column if not exists "display_id" serial;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "invoice" drop column if exists "display_id";`);
  }

}
