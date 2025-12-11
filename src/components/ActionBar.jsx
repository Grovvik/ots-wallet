import ActionButton from "./ActionButton.jsx";
import "../styles/ActionBar.css";

import SendIcon from "../assets/icons/action/send.svg?react";
import ReceiveIcon from "../assets/icons/action/receive.svg?react";
import SwapIcon from "../assets/icons/action/swap.svg?react";

function ActionBar({modal}) {
    return (
        <div className="action-bar">
            <ActionButton label="Send" icon={<SendIcon />} onClick={() => modal(true)}/>
            <ActionButton label="Receive" icon={<ReceiveIcon />} />
            <ActionButton label="Swap" icon={<SwapIcon />} />
        </div>
    );
}

export default ActionBar;
