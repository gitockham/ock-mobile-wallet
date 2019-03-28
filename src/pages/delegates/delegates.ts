import { Component, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Platform, Slides, Searchbar } from 'ionic-angular';

import { Subject } from 'rxjs/Subject';
import { ArkApiProvider } from '@providers/ark-api/ark-api';
// import { OckApiProvider } from '@providers/ock-api/ock-api';
// import { MlcApiProvider } from '@providers/mlc-api/mlc-api';
import { UserDataProvider } from '@providers/user-data/user-data';
import { ToastProvider } from '@providers/toast/toast';
import { Delegate, Network, VoteType, TransactionVote } from 'ark-ts';
// import { OckDelegate, OckNetwork, OckVoteType, OckTransactionVote } from 'ock-ts';
// import { MlcDelegate, MlcNetwork, MlcVoteType, MlcTransactionVote } from 'mlc-ts';

import { Wallet, WalletKeys } from '@models/model';

import * as constants from '@app/app.constants';
import { PinCodeComponent } from '@components/pin-code/pin-code';
import { ConfirmTransactionComponent } from '@components/confirm-transaction/confirm-transaction';

@IonicPage()
@Component({
  selector: 'page-delegates',
  templateUrl: 'delegates.html',
})
export class DelegatesPage implements OnDestroy {
  @ViewChild('delegateSlider') slider: Slides;
  @ViewChild('pinCode') pinCode: PinCodeComponent;
  @ViewChild('confirmTransaction') confirmTransaction: ConfirmTransactionComponent;
  @ViewChild('searchbar') searchbar: Searchbar;

  public isSearch = false;
  public searchQuery = '';

  public delegates: Delegate[];
  public activeDelegates: Delegate[];
  public standByDelegates: Delegate[];

  public supply = 0;
  public preMinned: number = constants.BLOCKCHAIN_PREMINNED;

  public rankStatus = 'active';
  public currentNetwork: Network;
  public slides: string[] = [
    'active',
    'standBy',
  ];

  private selectedDelegate: Delegate;
  private selectedFee: number;

  private currentWallet: Wallet;
  private walletVote: Delegate;

  private unsubscriber$: Subject<void> = new Subject<void>();
  private refreshListener;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    private arkApiProvider: ArkApiProvider,
    private zone: NgZone,
    private modalCtrl: ModalController,
    private userDataProvider: UserDataProvider,
    private toastProvider: ToastProvider,
  ) { }

  openDetailModal(delegate: Delegate) {

    const modal = this.modalCtrl.create('DelegateDetailPage', {
      delegate,
      vote: this.walletVote,
    }, { showBackdrop: false, enableBackdropDismiss: true });

    modal.onDidDismiss(({ delegateVote, fee }) => {
      if (!delegateVote) { return; }

      this.selectedFee = fee;
      this.selectedDelegate = delegateVote; // Save the delegate that we want to vote for
      this.pinCode.open('PIN_CODE.TYPE_PIN_SIGN_TRANSACTION', true, true);

    });

    modal.present();
  }

  toggleSearchBar() {
    this.searchQuery = '';
    this.isSearch = !this.isSearch;
    if (this.isSearch) {
      setTimeout(() => {
        this.searchbar.setFocus();
      }, 100);
    }
  }

  onSlideChanged(slider) {
    this.rankStatus = this.slides[slider.realIndex];
  }

  onSegmentChange() {
    this.slider.slideTo(this.slides.indexOf(this.rankStatus));
  }

  getTotalForged() {
    const forged = this.supply === 0 ? 0 : this.supply - this.preMinned;

    return forged;
  }

  isSameDelegate(delegatePublicKey) {
    if (this.currentWallet && this.walletVote && this.walletVote.publicKey === delegatePublicKey) {
      return true;
    }

    return false;
  }

  generateTransaction(keys: WalletKeys) {
    let type = VoteType.Add;

    if (this.walletVote && this.walletVote.publicKey === this.selectedDelegate.publicKey ) { type = VoteType.Remove; }

    const data: TransactionVote = {
      delegatePublicKey: this.selectedDelegate.publicKey,
      passphrase: keys.key,
      secondPassphrase: keys.secondKey,
      type,
    };

    this.arkApiProvider.api.transaction.createVote(data).subscribe((transaction) => {
      transaction.fee = this.selectedFee; // The transaction will be re-signed
      this.confirmTransaction.open(transaction, keys);
    });
  }

  private fetchCurrentVote() {
    if (!this.currentWallet) { return; }

    this.arkApiProvider.api.account
      .votes({ address: this.currentWallet.address })
      .takeUntil(this.unsubscriber$)
      .subscribe((data) => {
        if (data.success && data.delegates.length > 0) {
          this.walletVote = data.delegates[0];
        }
      }, () => {
        this.toastProvider.error('DELEGATES_PAGE.VOTE_FETCH_ERROR');
      });
  }

  private onUpdateDelegates() {
    this.arkApiProvider.onUpdateDelegates$
      .takeUntil(this.unsubscriber$)
      .do((delegates) => {
        this.zone.run(() => this.delegates = delegates);
      })
      .subscribe();
  }

  ionViewDidEnter() {
    this.currentNetwork = this.arkApiProvider.network;
    this.currentWallet = this.userDataProvider.currentWallet;
    this.zone.runOutsideAngular(() => {
      this.arkApiProvider.delegates.subscribe((data) => this.zone.run(() => {
        this.delegates = data;
        this.activeDelegates = this.delegates.slice(0, constants.NUM_ACTIVE_DELEGATES);
        this.standByDelegates = this.delegates.slice(constants.NUM_ACTIVE_DELEGATES, this.delegates.length);
      }));
    });

    this.onUpdateDelegates();
    this.fetchCurrentVote();
    this.arkApiProvider.fetchDelegates(constants.NUM_ACTIVE_DELEGATES * 2).subscribe();
  }

  ngOnDestroy() {
    clearInterval(this.refreshListener);

    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

}

/* export class OckDelegatesPage implements OnDestroy {
  @ViewChild('delegateSlider') slider: Slides;
  @ViewChild('pinCode') pinCode: PinCodeComponent;
  @ViewChild('confirmTransaction') confirmTransaction: ConfirmTransactionComponent;
  @ViewChild('searchbar') searchbar: Searchbar;

  public isSearch = false;
  public searchQuery = '';

  public delegates: OckDelegate[];
  public activeDelegates: OckDelegate[];
  public standByDelegates: OckDelegate[];

  public supply = 0;
  public preMinned: number = constants.BLOCKCHAIN_PREMINNED;

  public rankStatus = 'active';
  public currentNetwork: OckNetwork;
  public slides: string[] = [
    'active',
    'standBy',
  ];

  private selectedDelegate: OckDelegate;
  private selectedFee: number;

  private currentWallet: Wallet;
  private walletVote: OckDelegate;

  private unsubscriber$: Subject<void> = new Subject<void>();
  private refreshListener;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    private ockApiProvider: OckApiProvider,
    private zone: NgZone,
    private modalCtrl: ModalController,
    private userDataProvider: UserDataProvider,
    private toastProvider: ToastProvider,
  ) { }

  openDetailModal(delegate: OckDelegate) {

    const modal = this.modalCtrl.create('OckDelegateDetailPage', {
      delegate,
      vote: this.walletVote,
    }, { showBackdrop: false, enableBackdropDismiss: true });

    modal.onDidDismiss(({ delegateVote, fee }) => {
      if (!delegateVote) { return; }

      this.selectedFee = fee;
      this.selectedDelegate = delegateVote; // Save the delegate that we want to vote for
      this.pinCode.open('PIN_CODE.TYPE_PIN_SIGN_TRANSACTION', true, true);

    });

    modal.present();
  }

  toggleSearchBar() {
    this.searchQuery = '';
    this.isSearch = !this.isSearch;
    if (this.isSearch) {
      setTimeout(() => {
        this.searchbar.setFocus();
      }, 100);
    }
  }

  onSlideChanged(slider) {
    this.rankStatus = this.slides[slider.realIndex];
  }

  onSegmentChange() {
    this.slider.slideTo(this.slides.indexOf(this.rankStatus));
  }

  getTotalForged() {
    const forged = this.supply === 0 ? 0 : this.supply - this.preMinned;

    return forged;
  }

  isSameDelegate(delegatePublicKey) {
    if (this.currentWallet && this.walletVote && this.walletVote.publicKey === delegatePublicKey) {
      return true;
    }

    return false;
  }

  generateTransaction(keys: WalletKeys) {
    let type = OckVoteType.Add;

    if (this.walletVote && this.walletVote.publicKey === this.selectedDelegate.publicKey ) { type = OckVoteType.Remove; }

    const data: OckTransactionVote = {
      delegatePublicKey: this.selectedDelegate.publicKey,
      passphrase: keys.key,
      secondPassphrase: keys.secondKey,
      type,
    };

    this.ockApiProvider.api.transaction.createVote(data).subscribe((transaction) => {
      transaction.fee = this.selectedFee; // The transaction will be re-signed
      this.confirmTransaction.open(transaction, keys);
    });
  }

  private fetchCurrentVote() {
    if (!this.currentWallet) { return; }

    this.ockApiProvider.api.account
      .votes({ address: this.currentWallet.address })
      .takeUntil(this.unsubscriber$)
      .subscribe((data) => {
        if (data.success && data.delegates.length > 0) {
          this.walletVote = data.delegates[0];
        }
      }, () => {
        this.toastProvider.error('DELEGATES_PAGE.VOTE_FETCH_ERROR');
      });
  }

  private onUpdateDelegates() {
    this.ockApiProvider.onUpdateDelegates$
      .takeUntil(this.unsubscriber$)
      .do((delegates) => {
        this.zone.run(() => this.delegates = delegates);
      })
      .subscribe();
  }

  ionViewDidEnter() {
    this.currentNetwork = this.ockApiProvider.network;
    this.currentWallet = this.userDataProvider.currentWallet;
    this.zone.runOutsideAngular(() => {
      this.ockApiProvider.delegates.subscribe((data) => this.zone.run(() => {
        this.delegates = data;
        this.activeDelegates = this.delegates.slice(0, constants.NUM_ACTIVE_DELEGATES);
        this.standByDelegates = this.delegates.slice(constants.NUM_ACTIVE_DELEGATES, this.delegates.length);
      }));
    });

    this.onUpdateDelegates();
    this.fetchCurrentVote();
    this.ockApiProvider.fetchDelegates(constants.NUM_ACTIVE_DELEGATES * 2).subscribe();
  }

  ngOnDestroy() {
    clearInterval(this.refreshListener);

    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

} */

/* export class MlcDelegatesPage implements OnDestroy {
  @ViewChild('delegateSlider') slider: Slides;
  @ViewChild('pinCode') pinCode: PinCodeComponent;
  @ViewChild('confirmTransaction') confirmTransaction: ConfirmTransactionComponent;
  @ViewChild('searchbar') searchbar: Searchbar;

  public isSearch = false;
  public searchQuery = '';

  public delegates: MlcDelegate[];
  public activeDelegates: MlcDelegate[];
  public standByDelegates: MlcDelegate[];

  public supply = 0;
  public preMinned: number = constants.BLOCKCHAIN_PREMINNED;

  public rankStatus = 'active';
  public currentNetwork: MlcNetwork;
  public slides: string[] = [
    'active',
    'standBy',
  ];

  private selectedDelegate: MlcDelegate;
  private selectedFee: number;

  private currentWallet: Wallet;
  private walletVote: MlcDelegate;

  private unsubscriber$: Subject<void> = new Subject<void>();
  private refreshListener;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    private mlcApiProvider: MlcApiProvider,
    private zone: NgZone,
    private modalCtrl: ModalController,
    private userDataProvider: UserDataProvider,
    private toastProvider: ToastProvider,
  ) { }

  openDetailModal(delegate: MlcDelegate) {

    const modal = this.modalCtrl.create('MlcDelegateDetailPage', {
      delegate,
      vote: this.walletVote,
    }, { showBackdrop: false, enableBackdropDismiss: true });

    modal.onDidDismiss(({ delegateVote, fee }) => {
      if (!delegateVote) { return; }

      this.selectedFee = fee;
      this.selectedDelegate = delegateVote; // Save the delegate that we want to vote for
      this.pinCode.open('PIN_CODE.TYPE_PIN_SIGN_TRANSACTION', true, true);

    });

    modal.present();
  }

  toggleSearchBar() {
    this.searchQuery = '';
    this.isSearch = !this.isSearch;
    if (this.isSearch) {
      setTimeout(() => {
        this.searchbar.setFocus();
      }, 100);
    }
  }

  onSlideChanged(slider) {
    this.rankStatus = this.slides[slider.realIndex];
  }

  onSegmentChange() {
    this.slider.slideTo(this.slides.indexOf(this.rankStatus));
  }

  getTotalForged() {
    const forged = this.supply === 0 ? 0 : this.supply - this.preMinned;

    return forged;
  }

  isSameDelegate(delegatePublicKey) {
    if (this.currentWallet && this.walletVote && this.walletVote.publicKey === delegatePublicKey) {
      return true;
    }

    return false;
  }

  generateTransaction(keys: WalletKeys) {
    let type = MlcVoteType.Add;

    if (this.walletVote && this.walletVote.publicKey === this.selectedDelegate.publicKey ) { type = MlcVoteType.Remove; }

    const data: MlcTransactionVote = {
      delegatePublicKey: this.selectedDelegate.publicKey,
      passphrase: keys.key,
      secondPassphrase: keys.secondKey,
      type,
    };

    this.mlcApiProvider.api.transaction.createVote(data).subscribe((transaction) => {
      transaction.fee = this.selectedFee; // The transaction will be re-signed
      this.confirmTransaction.open(transaction, keys);
    });
  }

  private fetchCurrentVote() {
    if (!this.currentWallet) { return; }

    this.mlcApiProvider.api.account
      .votes({ address: this.currentWallet.address })
      .takeUntil(this.unsubscriber$)
      .subscribe((data) => {
        if (data.success && data.delegates.length > 0) {
          this.walletVote = data.delegates[0];
        }
      }, () => {
        this.toastProvider.error('DELEGATES_PAGE.VOTE_FETCH_ERROR');
      });
  }

  private onUpdateDelegates() {
    this.mlcApiProvider.onUpdateDelegates$
      .takeUntil(this.unsubscriber$)
      .do((delegates) => {
        this.zone.run(() => this.delegates = delegates);
      })
      .subscribe();
  }

  ionViewDidEnter() {
    this.currentNetwork = this.mlcApiProvider.network;
    this.currentWallet = this.userDataProvider.currentWallet;
    this.zone.runOutsideAngular(() => {
      this.mlcApiProvider.delegates.subscribe((data) => this.zone.run(() => {
        this.delegates = data;
        this.activeDelegates = this.delegates.slice(0, constants.NUM_ACTIVE_DELEGATES);
        this.standByDelegates = this.delegates.slice(constants.NUM_ACTIVE_DELEGATES, this.delegates.length);
      }));
    });

    this.onUpdateDelegates();
    this.fetchCurrentVote();
    this.mlcApiProvider.fetchDelegates(constants.NUM_ACTIVE_DELEGATES * 2).subscribe();
  }

  ngOnDestroy() {
    clearInterval(this.refreshListener);

    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

} */
