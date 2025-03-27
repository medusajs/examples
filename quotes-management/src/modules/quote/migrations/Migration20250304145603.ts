import { Migration } from '@mikro-orm/migrations';

export class Migration20250304145603 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop table if exists "message" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table if not exists "message" ("id" text not null, "text" text not null, "item_id" text null, "admin_id" text null, "customer_id" text null, "quote_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "message_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_message_quote_id" ON "message" (quote_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_message_deleted_at" ON "message" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "message" add constraint "message_quote_id_foreign" foreign key ("quote_id") references "quote" ("id") on update cascade;`);
  }

}
