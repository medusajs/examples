import { Migration } from '@mikro-orm/migrations';

export class Migration20250313081542 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "review" drop column if exists "raw_rating";`);

    this.addSql(`alter table if exists "review" alter column "rating" type real using ("rating"::real);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "review" add column if not exists "raw_rating" jsonb not null;`);
    this.addSql(`alter table if exists "review" alter column "rating" type numeric using ("rating"::numeric);`);
  }

}
