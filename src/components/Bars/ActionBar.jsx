import ButtonA from "../Buttons/ButtonA.jsx";
import "../../styles/Bars/ActionBar.css";

import SendIcon from "../../assets/icons/action/send.svg?react";
import ReceiveIcon from "../../assets/icons/action/receive.svg?react";
import SwapIcon from "../../assets/icons/action/swap.svg?react";

function ActionBar({modal}) {
    return (
        <div className="action-bar">
            <ButtonA label="Send" icon={<SendIcon />} onClick={() => modal(true)}/>
            <ButtonA label="Receive" icon={<ReceiveIcon />} />
            <ButtonA label="Swap" icon={<SwapIcon />} />
        </div>
    );
}

export default ActionBar;
