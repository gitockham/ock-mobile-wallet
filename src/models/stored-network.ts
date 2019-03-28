import { Network, Peer } from 'ark-ts';
// import { OckNetwork, OckPeer } from 'ock-ts';
// import { MlcNetwork, MlcPeer } from 'mlc-ts';

export interface FeeStatistic {
  type: number;
  fees: {
    minFee: number,
    maxFee: number,
    avgFee: number,
  };
}

export interface BlocksEpochResponse {
  success: boolean;
  epoch: string;
}

export class StoredNetwork extends Network {
  public marketTickerName: string;
  public peerList: Peer[];
  public feeStatistics: FeeStatistic[];
  public epoch: Date;
}

/* export class OckStoredNetwork extends OckNetwork {
  public marketTickerName: string;
  public peerList: OckPeer[];
  public feeStatistics: FeeStatistic[];
  public epoch: Date;
} */

/* export class MlcStoredNetwork extends MlcNetwork {
  public marketTickerName: string;
  public peerList: MlcPeer[];
  public feeStatistics: FeeStatistic[];
  public epoch: Date;
} */
