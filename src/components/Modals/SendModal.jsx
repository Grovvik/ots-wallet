import Input from "./Input.jsx";
import SlideModal from "./SlideModal.jsx"
import QrIcon from "../../assets/icons/qr.svg?react";
import "../../styles/Modals/SendModal.css";

function SendModal({state}) {
    const [isModalOpen, setIsModalOpen] = state;
    return (
        <SlideModal title="Send" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Input label="Recipient address" button={<div className="qr-btn"><QrIcon /></div>}></Input>
            <Input label="Amount" type="number"></Input>
        </SlideModal>
    )
}

export default SendModal