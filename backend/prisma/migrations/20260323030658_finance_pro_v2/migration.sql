/*
  Warnings:

  - Added the required column `userId` to the `Budget` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Budget] DROP CONSTRAINT [Budget_categoryId_fkey];

-- AlterTable
ALTER TABLE [dbo].[Account] ADD [deletedAt] DATETIME2;

-- AlterTable
ALTER TABLE [dbo].[Budget] ADD [userId] INT NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Category] ADD [deletedAt] DATETIME2;

-- AlterTable
ALTER TABLE [dbo].[RecurringExpense] ADD [tipo] NVARCHAR(1000) NOT NULL CONSTRAINT [RecurringExpense_tipo_df] DEFAULT 'GASTO';

-- AlterTable
ALTER TABLE [dbo].[Transaction] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [Transaction_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[deletedAt] DATETIME2;

-- AddForeignKey
ALTER TABLE [dbo].[Budget] ADD CONSTRAINT [Budget_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[Category]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Budget] ADD CONSTRAINT [Budget_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
