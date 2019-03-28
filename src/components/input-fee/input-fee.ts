import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { TransactionType } from 'ark-ts';
// import { OckTransactionType } from 'ock-ts';
// import { MlcTransactionType } from 'mlc-ts';

import { FeeStatistic } from '@models/stored-network';
import { ArkApiProvider } from '@providers/ark-api/ark-api';
// import { OckApiProvider } from '@providers/ock-api/ock-api';
// import { MlcApiProvider } from '@providers/mlc-api/mlc-api';
import { ArkUtility } from '../../utils/ark-utility';
// import { OckUtility } from '../../utils/ock-utility';
// import { MlcUtility } from '../../utils/mlc-utility';

import 'rxjs/add/operator/switchMap';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'input-fee',
  templateUrl: 'input-fee.html'
})
export class InputFeeComponent implements OnInit, OnDestroy {
  @Input()
  public transactionType: number;

  @Output()
  public onChange: EventEmitter<number> = new EventEmitter();

  public step: number;
  public v1Fee: number;
  public v2Fee: FeeStatistic;
  public rangeFee: number;
  public inputFee: string;
  public min: number;
  public max: number;
  public avg: number;
  public symbol: string;
  public isFeeLow = false;
  public subscription: Subscription;

  constructor(
    private arkApiProvider: ArkApiProvider
  ) {
    this.step = 1;
    this.min = this.step;
    this.symbol = this.arkApiProvider.network.symbol;
  }

  ngOnInit() {
    this.prepareFeeStatistics();
  }

  public prepareFeeStatistics() {
    this.subscription = this.arkApiProvider.fees.switchMap(fees => {
      switch (Number(this.transactionType)) {
        case TransactionType.SendArk:
          this.v1Fee = fees.send;
          break;
        case TransactionType.Vote:
          this.v1Fee = fees.vote;
          break;
        case TransactionType.CreateDelegate:
          this.v1Fee = fees.delegate;
          break;
      }

      this.max = this.v1Fee;
      this.avg = this.max / 2;
      this.setRangeFee(this.avg);

      return this.arkApiProvider.feeStatistics;
    }).subscribe(fees => {
      this.v2Fee = fees.find(fee => fee.type === Number(this.transactionType));
      if (this.v2Fee.fees.maxFee > this.max) {
        this.max = this.v2Fee.fees.maxFee;
      }
      this.avg = this.v2Fee.fees.avgFee;
      this.setRangeFee(this.avg);
    });
  }

  public setRangeFee(value: number) {
    this.rangeFee = value;
    this.onInputRange();
    this.emitChange();
  }

  public onInputRange() {
    const fee = ArkUtility.subToUnit(this.rangeFee);

    this.isFeeLow = this.avg > this.rangeFee;
    this.inputFee = fee;
  }

  public onInputText() {
    const arktoshi = parseInt(ArkUtility.unitToSub(this.inputFee));

    if (arktoshi !== this.rangeFee) {
      this.rangeFee = arktoshi;
    }

    this.emitChange();
  }

  public emitChange() {
    this.onChange.next(this.rangeFee);
  }

  ngOnDestroy () {
    this.subscription.unsubscribe();
  }

}

/* export class OckInputFeeComponent implements OnInit, OnDestroy {
  @Input()
  public transactionType: number;

  @Output()
  public onChange: EventEmitter<number> = new EventEmitter();

  public step: number;
  public v1Fee: number;
  public v2Fee: FeeStatistic;
  public rangeFee: number;
  public inputFee: string;
  public min: number;
  public max: number;
  public avg: number;
  public symbol: string;
  public isFeeLow = false;
  public subscription: Subscription;

  constructor(
    private ockApiProvider: OckApiProvider
  ) {
    this.step = 1;
    this.min = this.step;
    this.symbol = this.ockApiProvider.network.symbol;
  }

  ngOnInit() {
    this.prepareFeeStatistics();
  }

  public prepareFeeStatistics() {
    this.subscription = this.ockApiProvider.fees.switchMap(fees => {
      switch (Number(this.transactionType)) {
        case OckTransactionType.SendOck:
          this.v1Fee = fees.send;
          break;
        case OckTransactionType.Vote:
          this.v1Fee = fees.vote;
          break;
        case OckTransactionType.CreateDelegate:
          this.v1Fee = fees.delegate;
          break;
      }

      this.max = this.v1Fee;
      this.avg = this.max / 2;
      this.setRangeFee(this.avg);

      return this.ockApiProvider.feeStatistics;
    }).subscribe(fees => {
      this.v2Fee = fees.find(fee => fee.type === Number(this.transactionType));
      if (this.v2Fee.fees.maxFee > this.max) {
        this.max = this.v2Fee.fees.maxFee;
      }
      this.avg = this.v2Fee.fees.avgFee;
      this.setRangeFee(this.avg);
    });
  }

  public setRangeFee(value: number) {
    this.rangeFee = value;
    this.onInputRange();
    this.emitChange();
  }

  public onInputRange() {
    const fee = ArkUtility.subToUnit(this.rangeFee);

    this.isFeeLow = this.avg > this.rangeFee;
    this.inputFee = fee;
  }

  public onInputText() {
    const arktoshi = parseInt(ArkUtility.unitToSub(this.inputFee));

    if (arktoshi !== this.rangeFee) {
      this.rangeFee = arktoshi;
    }

    this.emitChange();
  }

  public emitChange() {
    this.onChange.next(this.rangeFee);
  }

  ngOnDestroy () {
    this.subscription.unsubscribe();
  }

} */

/* export class MlcInputFeeComponent implements OnInit, OnDestroy {
  @Input()
  public transactionType: number;

  @Output()
  public onChange: EventEmitter<number> = new EventEmitter();

  public step: number;
  public v1Fee: number;
  public v2Fee: FeeStatistic;
  public rangeFee: number;
  public inputFee: string;
  public min: number;
  public max: number;
  public avg: number;
  public symbol: string;
  public isFeeLow = false;
  public subscription: Subscription;

  constructor(
    private mlcApiProvider: MlcApiProvider
  ) {
    this.step = 1;
    this.min = this.step;
    this.symbol = this.mlcApiProvider.network.symbol;
  }

  ngOnInit() {
    this.prepareFeeStatistics();
  }

  public prepareFeeStatistics() {
    this.subscription = this.mlcApiProvider.fees.switchMap(fees => {
      switch (Number(this.transactionType)) {
        case MlcTransactionType.SendMlc:
          this.v1Fee = fees.send;
          break;
        case MlcTransactionType.Vote:
          this.v1Fee = fees.vote;
          break;
        case MlcTransactionType.CreateDelegate:
          this.v1Fee = fees.delegate;
          break;
      }

      this.max = this.v1Fee;
      this.avg = this.max / 2;
      this.setRangeFee(this.avg);

      return this.mlcApiProvider.feeStatistics;
    }).subscribe(fees => {
      this.v2Fee = fees.find(fee => fee.type === Number(this.transactionType));
      if (this.v2Fee.fees.maxFee > this.max) {
        this.max = this.v2Fee.fees.maxFee;
      }
      this.avg = this.v2Fee.fees.avgFee;
      this.setRangeFee(this.avg);
    });
  }

  public setRangeFee(value: number) {
    this.rangeFee = value;
    this.onInputRange();
    this.emitChange();
  }

  public onInputRange() {
    const fee = ArkUtility.subToUnit(this.rangeFee);

    this.isFeeLow = this.avg > this.rangeFee;
    this.inputFee = fee;
  }

  public onInputText() {
    const arktoshi = parseInt(ArkUtility.unitToSub(this.inputFee));

    if (arktoshi !== this.rangeFee) {
      this.rangeFee = arktoshi;
    }

    this.emitChange();
  }

  public emitChange() {
    this.onChange.next(this.rangeFee);
  }

  ngOnDestroy () {
    this.subscription.unsubscribe();
  }

} */
