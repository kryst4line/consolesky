import * as uuid from "uuid";

export class AuxPane {
  uuid: string = uuid.v4();
}

export class ThreadAuxPane extends AuxPane {
  type: AuxPaneType.THREAD = AuxPaneType.THREAD;
  uri: string;

  constructor(uri: string) {
    super();
    this.uri = uri;
  }
}

export class AuthorAuxPane extends AuxPane {
  type: AuxPaneType.AUTHOR = AuxPaneType.AUTHOR;
  did: string;
  handle: string;

  constructor(author: Partial<{did: string, handle: string}>) {
    super();
    this.did = author.did;
    this.handle = author.handle;
  }
}

export class ListAuxPane extends AuxPane {
  type: AuxPaneType.LIST = AuxPaneType.LIST;
  did: string;
}

export class GeneratorAuxPane extends AuxPane {
  type: AuxPaneType.GENERATOR = AuxPaneType.GENERATOR;
  uri: string;
}

export class SearchAuxPane extends AuxPane {
  type: AuxPaneType.SEARCH = AuxPaneType.SEARCH;
  query: string;

  constructor(query?: string) {
    super();
    this.query = query;
  }
}

export enum AuxPaneType {
  THREAD = 'THREAD',
  AUTHOR = 'AUTHOR',
  LIST = 'LIST',
  GENERATOR = 'GENERATOR',
  STARTER_PACK = 'STARTER_PACK',
  SEARCH = 'SEARCH',
}
