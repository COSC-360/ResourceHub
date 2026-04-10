import "./Logo.css";
import { HOMEROUTE } from "../../constants/RouteConstants.jsx";

export function Logo() {
    return (
        <>
            {/*This will be replaced with a logo once one is made*/}
            <a className="logo" href={HOMEROUTE}>
                Resource Hub
            </a>
        </>
    )
}