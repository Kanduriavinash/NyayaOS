import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { prisma } from '@nyayaos/database';

export class DocumentTools {
  @Tool({
    name: 'ocr',
    description: 'Perform optical character recognition (OCR) on an uploaded PDF or image file to extract text content',
    inputSchema: z.object({
      caseId: z.string().optional().describe('Optional database case ID to link this document'),
      file_name: z.string().describe('Name of the document file'),
      file_type: z.string().describe('MIME type of the file'),
      file_content: z.string().describe('Base64-encoded string representing the file content')
    })
  })
  async performOcr(input: { caseId?: string; file_name: string; file_type: string; file_content: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Performing OCR on file: ${input.file_name} (${input.file_type})`);

    // Simulate OCR processing based on base64 content size and file name
    const docSize = input.file_content.length;
    let extractedText = `Extracted text from ${input.file_name}:\n\n`;

    if (input.file_name.toLowerCase().includes('property') || input.file_name.toLowerCase().includes('deed')) {
      extractedText += `PROPERTY DEED CONVEYANCE WORKSPACE\n` +
        `This indenture made between the Owner and the Purchaser.\n` +
        `Subject Property: Survey No. 442, Sector 12, Nyaya Vihar.\n` +
        `Total Area: 2400 sq.ft. Registered Value: INR 50,00,000.\n` +
        `Signature: Present. Date of Registration: 12-May-2024.`;
    } else if (input.file_name.toLowerCase().includes('id') || input.file_name.toLowerCase().includes('aadhaar')) {
      extractedText += `GOVERNMENT OF INDIA\n` +
        `Aadhaar Number: XXXX-XXXX-1234\n` +
        `Name: Rajesh Kumar\n` +
        `Date of Birth: 01-Jan-1980\n` +
        `Gender: Male. Address: 121, Court Road, New Delhi.`;
    } else {
      extractedText += `STANDARD CIVIL PETITION BRIEF\n` +
        `In the Court of civil jurisdiction.\n` +
        `Petitioner: Citizen vs Respondent: State.\n` +
        `Case Title: Property Dispute Claim.\n` +
        `Details: The petitioner claims full ownership of the scheduled land based on registered deed.`;
    }

    if (input.caseId) {
      try {
        await prisma.document.create({
          data: {
            name: input.file_name,
            type: input.file_name.toLowerCase().includes('id') ? 'ID_PROOF' : 
                  input.file_name.toLowerCase().includes('deed') ? 'PROPERTY_DEED' : 'EVIDENCE',
            status: 'VALID',
            content: extractedText,
            caseId: input.caseId
          }
        });
        ctx.logger.info(`Successfully saved OCR document metadata to database for case: ${input.caseId}`);
      } catch (err: any) {
        ctx.logger.error(`Error saving document to database: ${err.message}`);
      }
    }

    return {
      status: 'success',
      fileName: input.file_name,
      fileSize: docSize,
      extractedText,
      confidence: 0.96
    };
  }

  @Tool({
    name: 'signature_detection',
    description: 'Verify if a document contains valid signatures',
    inputSchema: z.object({
      file_name: z.string().describe('Name of the document file'),
      file_content: z.string().describe('Base64-encoded string representing the file content')
    })
  })
  async detectSignature(input: { file_name: string; file_content: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Running signature detection on ${input.file_name}`);

    // Simulation: check if size is reasonable and name matches signature conditions
    const hasSignature = input.file_content.length > 500;
    
    return {
      status: 'success',
      fileName: input.file_name,
      hasSignature,
      confidence: 0.94,
      details: hasSignature 
        ? 'Detected signature match in the primary signature area (bottom right)'
        : 'No clear signature detected in the signature boxes'
    };
  }

  @Tool({
    name: 'missing_page_detection',
    description: 'Examine a document to determine if pages are missing or out of order',
    inputSchema: z.object({
      file_name: z.string().describe('Name of the document file'),
      file_content: z.string().describe('Base64-encoded string representing the file content')
    })
  })
  async detectMissingPages(input: { file_name: string; file_content: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Running missing page check on ${input.file_name}`);

    // Simulation check: files with 'corrupt' or 'missing' in the name are marked as incomplete
    const isComplete = !input.file_name.toLowerCase().includes('missing') && !input.file_name.toLowerCase().includes('corrupt');

    return {
      status: 'success',
      fileName: input.file_name,
      isComplete,
      totalPages: isComplete ? 5 : 4,
      missingPages: isComplete ? [] : [3],
      message: isComplete 
        ? 'All pages are present and sequential'
        : 'Page 3 is missing. Page sequence jumps from page 2 to page 4.'
    };
  }
}
