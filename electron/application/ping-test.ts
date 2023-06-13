import { UDPTerminal } from "../communication";
import State from "../communication/UDP/state";
import { PingMeasurement } from "./ping";

const state = new State("117324779009017873395", "1q2w3e");

const terminal = new UDPTerminal('127.0.0.1', 5001, state);// TODO: call terminal instance from somewhere...

const ping = new PingMeasurement(terminal);

ping.initPing(Infinity);

setInterval(() => console.log(ping.Ping), 500);