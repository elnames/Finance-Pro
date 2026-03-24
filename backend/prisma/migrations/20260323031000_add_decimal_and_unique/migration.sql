BEGIN TRY

BEGIN TRAN;

-- Drop default constraint on saldoActual before altering column type
DECLARE @constraint NVARCHAR(200);
SELECT @constraint = dc.name
FROM sys.default_constraints dc
JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
WHERE c.object_id = OBJECT_ID(N'[dbo].[Account]') AND c.name = N'saldoActual';
IF @constraint IS NOT NULL
    EXEC('ALTER TABLE [dbo].[Account] DROP CONSTRAINT ' + @constraint);

-- Change saldoActual from FLOAT to DECIMAL(18,2)
ALTER TABLE [dbo].[Account] ALTER COLUMN [saldoActual] DECIMAL(18,2) NOT NULL;

-- Re-add default constraint
ALTER TABLE [dbo].[Account] ADD CONSTRAINT [Account_saldoActual_df] DEFAULT 0 FOR [saldoActual];

-- Add unique constraint to Budget
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'Budget_categoryId_mes_anio_key'
    AND object_id = OBJECT_ID(N'[dbo].[Budget]')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [Budget_categoryId_mes_anio_key]
    ON [dbo].[Budget]([categoryId], [mes], [anio]);
END

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW;

END CATCH
