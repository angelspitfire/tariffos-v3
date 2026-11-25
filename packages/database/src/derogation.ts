export async function fetchAndValidateDraft(tx: any, draftId: string) {
  const draft = await tx.legalKnowledgeParent.findUnique({
    where: { id: draftId }
  });

  if (!draft) {
    throw new Error(`Draft with ID ${draftId} not found.`);
  }

  return draft;
}

export async function sunsetOverlappingRecords(
  tx: any,
  draftId: string,
  countryCode: string,
  hierarchyPath: string | null,
  validFromDate: Date | null
) {
  const overlappingRecords = await tx.legalKnowledgeParent.findMany({
    where: {
      id: { not: draftId },
      countryCode,
      isDerogated: false,
      status: "PUBLISHED",
      hierarchyPath: {
        startsWith: hierarchyPath || ""
      }
    }
  });

  if (overlappingRecords.length > 0) {
    const fromDate = validFromDate || new Date();
    const derogationDate = new Date(fromDate.getTime() - 1);

    await tx.legalKnowledgeParent.updateMany({
      where: {
        id: { in: overlappingRecords.map((r: any) => r.id) }
      },
      data: {
        isDerogated: true,
        status: "DEROGATED",
        validToDate: derogationDate,
      }
    });
    console.log(`[Derogation] Sunset ${overlappingRecords.length} overlapping records for path: ${hierarchyPath}`);
  }
}
