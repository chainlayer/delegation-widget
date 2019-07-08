<template>
    <div class="terraLedger" style="width: 300px; display:inline-block; vertical-align:top">
        <img src="/img/logo-terra.svg" alt="Terra" title="Terra" width="145" height="46"><br>
        <span v-if="this.staked!=''"><label>Staked by ChainLayer: </label><br>
            <span>{{staked}} {{denom}} ({{stakedUSD}})</span><br></span>
        <span v-if="this.price!=''">Price {{denom}}: $ {{price}}</span><br>
        <button v-if="this.$browserDetect.meta.name=='Chrome'" v-on:click="show" class="btn btn-outline-success">Delegate</button>

        <modal name="terra-modal" :width="600" :draggable="true" :scrollable="true" height="auto">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Ledger Delegation ChainLayer</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" v-on:click="hide">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>
                        <span style="color: forestgreen;"><i class="fas fa-plug fa-3x"></i></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <span v-if="this.readytodelegate" style="color: forestgreen;"><i class="fas fa-coins fa-3x"></i></span>
                        <span v-if="!this.readytodelegate"><i class="fas fa-coins fa-3x"></i></span>
                    </p>
                    <span v-if="this.connecting==true"><div class="alert alert-info">Looking for ledger</div><br><img src="/img/Spinner.gif" height="93" width="93"/><br></span>
                    <span v-if="this.isdelegating==true"><div class="alert alert-info">Delegating, please check ledger</div><br><img src="/img/Spinner.gif" height="93" width="93"/><br></span>
                    <span v-if="this.success!=''"><div class="alert alert-success">{{success}}</div></span>
                    <span v-if="this.error!=''"><div class="alert alert-warning">{{error}}</div></span>
                    <span v-if="this.connecting==false && this.connected==false"><button v-on:click="tryConnect" class="btn btn-outline-success">Connect Ledger</button><br></span>
                    <span v-if="this.bech32!=''"><b>Your Adress</b><br></span>
                    <span v-if="this.bech32!=''"><b>{{bech32}}</b><br><br></span>
                    <label v-if="this.balance_available!=''">Available Balance: </label><span v-if="this.balance_available!=''">{{balance_available}} {{denom}}<br></span>
                    <label v-if="this.balance_delegated!=''">Delegated Balance: </label><span v-if="this.balance_delegated!=''">{{balance_delegated}} {{denom}}<br></span>
                    <label v-if="this.balance_total!=''">Total Balance: </label><span v-if="this.balance_total!=''">{{balance_total}} {{denom}}<br><br></span>
                    <label v-if="this.readytodelegate">Amount to delegate to ChainLayer (in {{denom}}): </label>
                    <input v-model.number="delegation" type="number" v-if="this.readytodelegate" @keypress="onlyNumber" class="form-control" ><br>
                    <br>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" v-on:click="delegate" v-if="this.readytodelegate">Delegate</button>&nbsp;
                    <button type="button" class="btn btn-secondary" v-on:click="tryConnect" v-if="this.readytodelegate">Refresh</button>&nbsp;
                    <button type="button" class="btn btn-secondary" v-on:click="hide">Done</button>
                </div>
            </div>
        </modal>
    </div>
</template>

<script>
    var { TerraDelegateTool } = require("cosmos-sdk-delegation-lib");
    import TransportU2F from '@ledgerhq/hw-transport-u2f';
    import Big from 'big.js';

    const transport = new TransportU2F();
    const cdt = new TerraDelegateTool(transport);
    cdt.setNodeURL('https://columbus-lcd.chainlayer.net');

    var curformatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    var amtformatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    });

    export default {
        name: 'TerraLedger',
        props: {
            restUrl: String,
        },
        data() {
            return {
                myAddr: '',
                bech32: '',
                pk: '',
                path: '',
                accInfo: '',
                sequence: '',
                delegation: '',
                reply: '',
                balance_available: '',
                balance_delegated: '',
                balance_total: '',
                connected: false,
                connecting: false,
                readytodelegate: false,
                debug: true,
                denom: '',
                staked: '',
                stakedUSD: '',
                error: '',
                price: '',
                chainId: '',
                validator: '',
                rewards: '',
                isdelegating: '',
                success: '',
                hrp: ''
            }
        },
        computed: {
            consoleStatus() {
                return this.consoleLog;
            },
        },
        created: function() {
            this.init();
        },
        methods: {
            show () {
                this.$modal.show('terra-modal');
            },
            hide () {
                this.$modal.hide('terra-modal');
            },
            onlyNumber ($event) {
                //console.log($event.keyCode); //keyCodes value
                let keyCode = ($event.keyCode ? $event.keyCode : $event.which);
                if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) { // 46 is dot
                    $event.preventDefault();
                }
            },
            log: function (list, msg) {
                if (this.debug) {
                    // eslint-disable-next-line
                    console.log(msg);
                }
            },
            init: async function () {
                this.success = '';
                this.error = '';
                this.myAddr = null;
                this.denom = 'Luna';
                this.isdelegating=false;
                this.readytodelegate = false;
                this.baseamount = 1000000;
                this.validator = 'terravaloper1kgddca7qj96z0qcxr2c45z73cfl0c75paknc5e';
                this.chainId = 'columbus-2';

                this.log(this.consoleLog, "Trying to connect...");

                // First get Validator Info
                this.validators = await cdt.retrieveValidators();
                this.staked = amtformatter.format(Big(this.validators[this.validator].totalShares / this.baseamount));

                this.price = await cdt.getPrice();
                this.stakedUSD = curformatter.format(Big(this.validators[this.validator].totalShares / this.baseamount * this.price));
                this.$emit("terraStake", Big(this.validators[this.validator].totalShares / this.baseamount * this.price));
            },
            tryConnect: async function () {
                this.success = '';
                this.isdelegating=false;
                this.error = '';
                try {
                    this.connecting = true;
                    await cdt.connect();
                } catch(e) {
                    // TODO: Handle error if not logged in
                    if (e == "Error: Unknown Status Code: undefined") {
                        this.error = "Can't find Ledger! Please connect Ledger, enter your pin code and start Terra app. Then click connect again...";
                    }
                    this.log(this.consoleLog, e);
                    this.connected = false;
                    this.connecting = false;
                    return;
                }
                if (!cdt.connected) {
                    this.connected = false;
                    this.log(this.consoleLog, cdt.lastError);
                    return;
                }
                this.log(this.consoleLog, "Connected!");

                try {
                    this.myAddr = await cdt.retrieveAddress(0, 0);
                } catch(e) {
                    this.log(this.consoleLog, e);
                    if (e=='Error: Unknown Status Code: 26628') {
                        this.error = 'Enter Pin on Ledger';
                    }
                    this.connected = false;
                    this.connecting = false;
                    return
                }
                this.bech32 = this.myAddr.bech32;
                this.pk = this.myAddr.pk;
                this.path = this.myAddr.path;
                this.log(this.consoleLog, this.myAddr);
                this.log(this.consoleLog, `Address  : ${this.myAddr.bech32}`);
                this.log(this.consoleLog, `PublicKey: ${this.myAddr.pk}`);
                this.log(this.consoleLog, `Query ${this.myAddr.bech32}`);

                this.accInfo = await cdt.getAccountInfo(this.myAddr);
                if (this.accInfo.error) {
                    this.log(this.consoleLog, "getAccountInfo error");
                    this.log(this.consoleLog, this.accInfo.error);
                    return
                } else {
                    this.log(this.consoleLog, this.accInfo.error);
                    this.log(this.consoleLog, this.accInfo);
                    this.sequence = this.accInfo.sequence;
                    this.balance_available = amtformatter.format(Big(this.accInfo.balance/this.baseamount));
                    this.delegation = parseInt(this.balance_available);
                }

                this.reply = await cdt.retrieveBalances([this.myAddr]);
                if (this.reply.error) {
                    this.log(this.consoleLog, "retrieveBalances error");
                    this.log(this.consoleLog, this.reply.error);
                    return
                } else {
                    this.log(this.consoleLog, this.reply);
                    this.balance_delegated = amtformatter.format(Big(this.reply[0].delegationsTotal/this.baseamount));
                    this.balance_total = amtformatter.format(Big(this.reply[0].delegationsTotal/this.baseamount).add(Big(this.accInfo.balance/this.baseamount)));
                    this.log(this.consoleLog, this.reply[0].delegationsTotal);
                }
                this.readytodelegate = true;
                this.connecting = false;
                this.connected = true;
            },
            delegate: async function () {
                this.error = '';
                if (this.delegation>this.balance_available) {
                    this.error = 'You cannot delegate more than available balance';
                    this.isdelegating=false;
                    return;
                }
                if (this.delegation<=0) {
                    this.error = 'You need to delegate more than 0';
                    this.isdelegating=false;
                    return;
                }
                this.isdelegating=true;

                const txContext = {
                    chainId: this.chainId,
                    path: this.myAddr.path,
                    bech32: this.myAddr.bech32,
                    pk: this.myAddr.pk,
                };

                const dummyTx = await cdt.txCreateDelegate(
                    txContext,
                    this.validator,
                    this.delegation * this.baseamount,   // TODO change this
                    'Delegation to ChainLayer.io',
                );

                this.log(this.consoleLog, "Waiting for device to sign");

                var signedTx = '';
                try {
                    signedTx = await cdt.sign(dummyTx, txContext);
                } catch(e) {
                    this.log(this.consoleLog, e);
                    if (e=='Error: Transaction rejected') {
                        this.error = 'Transaction rejected';
                    } else if (e=='Error: Cosmos app does not seem to be open') {
                            this.error = 'Ledger App does not seem to be open';
                    } else {
                        this.error = 'Unknown Error';
                    }
                    this.isdelegating=false;
                    return
                }

                this.log(this.consoleLog, "Broadcasting signed tx");
                var response = '';
                try {
                    response = await cdt.txSubmit(signedTx);
                    if (response.error) {
                        this.error = response.error;
                        this.log(this.consoleLog, response);
                        this.isdelegating=false;
                        return
                    }
                } catch(e) {
                    this.log(this.consoleLog, e);
                    if (e=='Error: Transaction rejected') {
                        this.error = 'Transaction rejected';
                    } else {
                        this.error = 'Unknown Error';
                    }
                    this.isdelegating=false;
                    return
                }
                this.success = 'Delegation successfull! Please wait 30 seconds to refresh';
                this.log(this.consoleLog, response);
                this.isdelegating=false;
            }
        }
    }
</script>

