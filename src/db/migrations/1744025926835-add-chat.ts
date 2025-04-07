import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChat1744025926835 implements MigrationInterface {
  name = 'AddChat1744025926835';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "chats" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "messages" jsonb NOT NULL,
                CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "chats"
        `);
  }
}
