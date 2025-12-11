import Address from "./address.js";

const endpoint = 'https://api.ots.su/json/'

async function get(url) {
    if (!url) return;
    const response = await fetch(endpoint+url);
    if (response.code == 200) return await response.json();
}

async function getTransaction(address) {
    if (Address.fromAddress(address)) {
        const resp = await get('transactions/'+address);
        if (resp && resp.ok === true) return resp;
    }
}

async function getBalance(address) {
    if (Address.fromAddress(address)) {
        const resp = await get('balance/'+address);
        if (resp && resp.ok === true) return resp;
    }
}

async function getNonce(address) {
    if (Address.fromAddress(address)) {
        const resp = await get('nonce/'+address);
        if (resp && resp.ok === true) return resp;
    }
}

export default { getTransaction, getBalance, getNonce }
