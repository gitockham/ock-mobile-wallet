import { UserDataProvider } from '@providers/user-data/user-data';
import { Injectable } from '@angular/core';
import { PublicKey } from 'ark-ts/core';
import { Network } from 'ark-ts';
// import { OckPublicKey } from 'ock-ts/core';
// import { OckNetwork } from 'ock-ts';
// import { MlcPublicKey } from 'mlc-ts/core';
// import { MlcNetwork } from 'mlc-ts';
import { isNil } from 'lodash';

@Injectable()
export class NetworkProvider {

  public get currentNetwork(): Network {
    return this.userDataProvider.currentNetwork;
  }

  public constructor(private userDataProvider: UserDataProvider) {
  }

  public isValidAddress(address: string, specificVersion?: number): boolean {
    const network: Network = !isNil(specificVersion) ? {version: specificVersion} as any : this.currentNetwork;
    return address
           && network
           && PublicKey.validateAddress(address, network);
  }
}

/* export class OckNetworkProvider {

  public get currentNetwork(): OckNetwork {
    return this.userDataProvider.currentNetwork;
  }

  public constructor(private userDataProvider: UserDataProvider) {
  }

  public isValidAddress(address: string, specificVersion?: number): boolean {
    const network: Network = !isNil(specificVersion) ? {version: specificVersion} as any : this.currentNetwork;
    return address
           && network
           && OckPublicKey.validateAddress(address, network);
  }
} */

/* export class MlcNetworkProvider {

  public get currentNetwork(): MlcNetwork {
    return this.userDataProvider.currentNetwork;
  }

  public constructor(private userDataProvider: UserDataProvider) {
  }

  public isValidAddress(address: string, specificVersion?: number): boolean {
    const network: Network = !isNil(specificVersion) ? {version: specificVersion} as any : this.currentNetwork;
    return address
           && network
           && MlcPublicKey.validateAddress(address, network);
  }
} */
