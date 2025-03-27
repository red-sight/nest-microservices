import { IApiDocMergeItem } from "../api-doc.service";

export abstract class GatewayProvider {
  abstract configure(items: IApiDocMergeItem[]): Promise<void>;
}
