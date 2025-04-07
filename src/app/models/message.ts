import * as uuid from "uuid";

export class Message {
  text: string;
  type: 'info' | 'error';
  uuid: string = uuid.v4();
}
