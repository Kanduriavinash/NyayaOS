import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';

export class DocumentResources {
  @Resource({
    uri: 'app://filing-templates',
    name: 'Judicial Filing Templates',
    description: 'Standard document templates for filing court petitions',
    mimeType: 'application/json'
  })
  async getFilingTemplates(ctx: ExecutionContext) {
    return {
      propertyDispute: {
        title: 'PLAINT UNDER SECTION 9 OF THE CODE OF CIVIL PROCEDURE',
        sections: [
          'Jurisdiction and Venue',
          'Details of Parties (Plaintiff and Defendant)',
          'Cause of Action (Date, description of dispute)',
          'Schedule of Property (Location, borders, area)',
          'Reliefs Claimed (Possession, injunction, damages)',
          'Verification Paragraph (Affidavit details)'
        ]
      },
      consumerCase: {
        title: 'COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT',
        sections: [
          'Details of goods/services purchased',
          'Consideration paid (Receipt proof)',
          'Defects or deficiency in service',
          'Representation sent to the seller',
          'Compensation claimed'
        ]
      }
    };
  }

  @Resource({
    uri: 'app://required-checklists',
    name: 'Document Requirements Checklist',
    description: 'Checklist of necessary documents required for each category of lawsuit',
    mimeType: 'application/json'
  })
  async getChecklists(ctx: ExecutionContext) {
    return {
      PROPERTY_DISPUTE: {
        required: [
          { name: 'Identity Proof', type: 'ID_PROOF', desc: 'Aadhaar, Passport, or PAN' },
          { name: 'Property Conveyance/Sale Deed', type: 'PROPERTY_DEED', desc: 'Registered property ownership proof' },
          { name: 'Tax Receipts', type: 'EVIDENCE', desc: 'Municipal tax/land revenue receipts' }
        ],
        optional: [
          { name: 'Survey Map', type: 'EVIDENCE', desc: 'Approved map from planning authority' },
          { name: 'Photographs', type: 'EVIDENCE', desc: 'Physical site condition images' }
        ]
      },
      CONSUMER_CASE: {
        required: [
          { name: 'Purchase Invoice', type: 'EVIDENCE', desc: 'Invoice or bill with tax details' },
          { name: 'Warranty Card', type: 'EVIDENCE', desc: 'Manufacturer warranty terms' }
        ],
        optional: [
          { name: 'Expert Opinion Report', type: 'EVIDENCE', desc: 'Technical assessment of defect' }
        ]
      }
    };
  }
}
