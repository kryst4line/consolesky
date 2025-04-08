export class AuxPane {
}

export class ThreadAuxPane extends AuxPane {
  type: AuxPaneType.THREAD = AuxPaneType.THREAD;
  uri: string;
}

export class AuthorAuxPane extends AuxPane {
  type: AuxPaneType.AUTHOR = AuxPaneType.AUTHOR;
  did: string;
  handle: string;
  displayName: string;
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
}

export enum AuxPaneType {
  THREAD = 'THREAD',
  AUTHOR = 'AUTHOR',
  LIST = 'LIST',
  GENERATOR = 'GENERATOR',
  STARTER_PACK = 'STARTER_PACK',
  SEARCH = 'SEARCH',
}
