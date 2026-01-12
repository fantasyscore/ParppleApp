export interface UserProps {
  id: string;
  name: string;
  phone: string;
  email: string;
  userRole: UserRole;
  phoneCountry?: any;
  status: string;
  creationTimestamp: number;
  updationTimestamp: number;
  token: string;
  accountStatus: string;
  roles: string[];
  code: number;
  roleId?: any;
}

export interface UserRole {
  id: number;
  userId: string;
  roleId: string;
}

export interface Company {
  id?: number | undefined | null;
  userId: string;
  tradeLicenseNum: string;
  tradeName: string;
  address1: string;
  address2: string;
  address3: string;
  taxNum: string;
  authSignName: string;
  designation: string;
  contact: string;
  email: string;
  profileStatus?: string;
  iamAuth: boolean;
}

export interface Bank {
  id?: number | undefined;
  userId: string;
  accountNum: string;
  ibanNum: string;
  bankName: string;
  branchName: string;
  swiftCode: string;
  profileStatus?: string;
}
export interface Document {
  id: Id;
  documentInfo: DocumentInfo;
  file: File;
  proofFile: any;
  creationTimestamp: number;
  updationTimestamp: number;
  docExpiryDate: any;
}
export interface Id {
  documentInfoId: number;
  merchantId: string;
}
export interface DocumentInfo {
  id: number;
  title: string;
  description: string;
  mandatory: boolean;
  enabled: boolean;
}
export interface File {
  id: string;
  fileName: string;
  fileType: string;
}

export interface BuyerPlatform {
  merchantBuyerPlatformsId: MerchantBuyerPlatformsId;
  merchant: Merchant;
  buyerPlatform: BuyerPlatform2;
  status: string;
  active: boolean;
  factParamId?: number;
  isSelected?: boolean;
}
export interface MerchantBuyerPlatformsId {
  merchantId: string;
  buyerPlatformsId: number;
}
export interface Merchant {
  id: string;
  user: UserProps;
  documentStatus: string;
  displayId: string;
  accountStatus: string;
  rating: string;
  page: any;
  size: any;
  sort: any;
}

export interface BuyerPlatform2 {
  id: number;
  logo: Logo;
  name: string;
  identifier: string;
  typeDescription: string;
  linkedWith: number;
  emailTo?: string;
  emailCC?: string;
  logoPath: any;
  vertical?: string;
  authPersonName?: string;
  authPersonDesignation?: string;
  authPersonPhoneNumber?: string;
  creationTimestamp: number;
  updationTimestamp: number;
  page: any;
  size: any;
  sort: any;
  active: boolean;
  isSelected?: boolean;
  isLinkedBuyerSelected?: boolean;
  isLinkedBuyer?: any;
  isVerified?: boolean;
  linkedPlatform?: any;
}

export interface Logo {
  id: string;
  fileName: string;
  fileType: string;
}
export interface MechantProps {
  user: UserProps;
  company: Company;
  bank: Bank;
  documents: Document[];
  documentStatus: string;
  buyerPlatforms: BuyerPlatform[];
  rating: string;
}

export interface AuthState {
  isLoading: boolean;
  bottomRemove?:false;
  addProfileData?:any;
  listProfiles:[];
  likeByOtherData:undefined;
  likeYouData:undefined;
  viewByOtherData:undefined;
  viewYouData:undefined;
  otherUserProfile:undefined;
  userData:undefined;
  attributes:[];
  filterData:undefined;
  discoverProfileData:[];
  emailAuth:undefined;
  newMatches:[];
  matchChatUserDetails:undefined;
  chatHistory:[];
  recentMatches:[];
  receivedcrushNotes:[];
  showMessage:undefined;
}
export interface DeviceTokenParams {
  merchantId: string;
  deviceType: number;
  deviceMake: number;
  deviceId: string;
  deviceToken: string | null;
  deviceActive: number;
  isDefault: number;
}

export interface SignUpProps {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  status?: string;
  phoneCountry?: string;
  roleId?: string;
}
