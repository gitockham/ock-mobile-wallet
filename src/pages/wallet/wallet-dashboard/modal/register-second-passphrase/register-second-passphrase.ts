import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { ArkApiProvider } from '@providers/ark-api/ark-api';
// import { OckApiProvider } from '@providers/ock-api/ock-api';
// import { MlcApiProvider } from '@providers/mlc-api/mlc-api';

import bip39 from 'bip39';
import { Fees, Network } from 'ark-ts';
// import { OckFees, OckNetwork } from 'ock-ts';
// import { MlcFees, MlcNetwork } from 'mlc-ts';

@IonicPage()
@Component({
  selector: 'page-register-second-passphrase',
  templateUrl: 'register-second-passphrase.html',
})
export class RegisterSecondPassphrasePage {

  public passphrase: string;
  public repassphrase: string;
  public fees: Fees;
  public currentNetwork: Network;

  public step = 1;
  public isWrong = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private arkApiProvider: ArkApiProvider,
  ) {
  }

  prev() {
    this.step -= 1;
  }

  next() {
    this.repassphrase = undefined;
    this.isWrong = false;
    this.step += 1;
  }

  create() {
    if (this.passphrase !== this.repassphrase) {
      this.isWrong = true;
      return;
    }

    this.dismiss(this.passphrase);
  }

  dismiss(result?: any) {
    this.viewCtrl.dismiss(result);
  }

  ionViewDidLoad() {
    this.passphrase = bip39.generateMnemonic();
    this.currentNetwork = this.arkApiProvider.network;
    this.arkApiProvider.fees.subscribe((fees) => this.fees = fees);
  }

}

/* export class OckRegisterSecondPassphrasePage {

  public passphrase: string;
  public repassphrase: string;
  public fees: OckFees;
  public currentNetwork: OckNetwork;

  public step = 1;
  public isWrong = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private ockApiProvider: OckApiProvider,
  ) {
  }

  prev() {
    this.step -= 1;
  }

  next() {
    this.repassphrase = undefined;
    this.isWrong = false;
    this.step += 1;
  }

  create() {
    if (this.passphrase !== this.repassphrase) {
      this.isWrong = true;
      return;
    }

    this.dismiss(this.passphrase);
  }

  dismiss(result?: any) {
    this.viewCtrl.dismiss(result);
  }

  ionViewDidLoad() {
    this.passphrase = bip39.generateMnemonic();
    this.currentNetwork = this.ockApiProvider.network;
    this.ockApiProvider.fees.subscribe((fees) => this.fees = fees);
  }

} */

/* export class MlcRegisterSecondPassphrasePage {

  public passphrase: string;
  public repassphrase: string;
  public fees: MlcFees;
  public currentNetwork: MlcNetwork;

  public step = 1;
  public isWrong = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private mlcApiProvider: MlcApiProvider,
  ) {
  }

  prev() {
    this.step -= 1;
  }

  next() {
    this.repassphrase = undefined;
    this.isWrong = false;
    this.step += 1;
  }

  create() {
    if (this.passphrase !== this.repassphrase) {
      this.isWrong = true;
      return;
    }

    this.dismiss(this.passphrase);
  }

  dismiss(result?: any) {
    this.viewCtrl.dismiss(result);
  }

  ionViewDidLoad() {
    this.passphrase = bip39.generateMnemonic();
    this.currentNetwork = this.mlcApiProvider.network;
    this.mlcApiProvider.fees.subscribe((fees) => this.fees = fees);
  }

} */
