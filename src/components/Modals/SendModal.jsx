import { useState } from "react";
import Input from "../Input.jsx";
import Modal from "./Modal.jsx"
import "../../styles/Modals/SendModal.css";
import MaxAmount from "../MaxAmount.jsx";
import QrIcon from "../../assets/icons/qr.svg?react";

function SendModal({ state }) {
    const [isModalOpen, setIsModalOpen] = state;
    const balance = 123;
    const [amount, setAmount] = useState("");
    const [recipient, setRecipient] = useState("");
    const handleMaxClick = () => {
        setAmount(balance.toString());
    };

    return (
        <Modal title="Send" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="send-inputs">
                <Input label="Recipient address" button={
                    <div className="qr-btn"><QrIcon /></div>
                } state={[recipient, setRecipient]}/>
                <Input label="Amount" type="number" state={[amount, setAmount]}/>
                <div className="send-note">
                    <span>Fee: 0.1 OTS</span>
                    <MaxAmount name="Avialable" currency="OTS" amount={(balance*1000-amount*1000) / 1000} onClick={handleMaxClick}/>
                </div>
            </div>
        </Modal>
    )
}

export default SendModal