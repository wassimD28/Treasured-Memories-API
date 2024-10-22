import { ModelTypeName } from "../Enums/common.enum";

export interface DecodedToken {
  userId: string;
  roles?: string[];
  entityEeq?: ModelTypeName;
}