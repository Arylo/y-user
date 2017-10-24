export interface IDefaultRaw {
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserRaw extends IDefaultRaw {
    username: string;
    password: string;
    active: boolean;
}

export interface IEncryptClass {
    encryptFn(value: string): string;
    compareFn(inputVal: string, dbVal: string): boolean;
}
