import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateKnowledgeEmbeddingToVector1770740600000 implements MigrationInterface {
    name = 'UpdateKnowledgeEmbeddingToVector1770740600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure pgvector extension exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);
        
        // Alter column type from json to vector(1536)
        // Note: This will drop existing data in the column because json cannot be directly cast to vector easily in all cases
        // For a demo/dev environment, dropping is acceptable. In production, we'd need a more complex migration script.
        await queryRunner.query(`ALTER TABLE "knowledge" DROP COLUMN "embedding"`);
        await queryRunner.query(`ALTER TABLE "knowledge" ADD "embedding" vector(1536)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "knowledge" DROP COLUMN "embedding"`);
        await queryRunner.query(`ALTER TABLE "knowledge" ADD "embedding" json`);
    }
}
