import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocuments1744026764555 implements MigrationInterface {
  name = 'AddDocuments1744026764555';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "documents" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "content" text NOT NULL,
                "embeddings" vector(1536) NOT NULL,
                CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "documents"
        `);
  }
}
