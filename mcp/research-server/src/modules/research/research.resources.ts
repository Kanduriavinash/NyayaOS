import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';

export class ResearchResources {
  @Resource({
    uri: 'app://acts-catalogue',
    name: 'Judicial Acts Catalogue',
    description: 'List of governing Acts and Statutes of civil and consumer jurisdiction',
    mimeType: 'application/json'
  })
  async getActsCatalogue(ctx: ExecutionContext) {
    return [
      { id: 'tp-1882', name: 'The Transfer of Property Act, 1882', scope: 'Civil / Property transfers' },
      { id: 'sr-1963', name: 'The Specific Relief Act, 1963', scope: 'Possession recovery & contract enforcement' },
      { id: 'cp-2019', name: 'The Consumer Protection Act, 2019', scope: 'Defects in goods, services and trade practices' },
      { id: 'cpc-1908', name: 'The Code of Civil Procedure, 1908', scope: 'Standard judicial processes and rules' }
    ];
  }
}
