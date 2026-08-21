import { Button } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";

const LS_NAME = 'audioMessageRate';

export default function Audio({ url }) {
    const audioRef = useRef(null);
    const [audioRate, setAudioRate] = useState( parseFloat(localStorage.getItem(LS_NAME) || "1") );
    const [showButtonRate, setShowButtonRate] = useState(false);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = audioRate;
        }
        localStorage.setItem(LS_NAME, audioRate);
    }, [audioRate]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return undefined;

        setLoadError(false);
        audio.onplaying = () => {
            setShowButtonRate(true);
        };
        audio.onpause = () => {
            setShowButtonRate(false);
        };
        audio.onended = () => {
            setShowButtonRate(false);
        };
        audio.onerror = () => {
            setShowButtonRate(false);
            setLoadError(true);
        };

        return () => {
            audio.onplaying = null;
            audio.onpause = null;
            audio.onended = null;
            audio.onerror = null;
        };
    }, [url]);

    const toogleRate = () => {
        let newRate = null;

        switch(audioRate) {
            case 0.5:
                newRate = 1;
                break;
            case 1:
                newRate = 1.5;
                break;
            case 1.5:
                newRate = 2;
                break;
            case 2:
                newRate = 0.5;
                break;
            default:
                newRate = 1;
                break;
        }
        
        setAudioRate(newRate);
    };

    return (
        <>
            <audio ref={audioRef} controls src={url} />
            {loadError && (
                <div style={{ color: "#b42318", fontSize: 12, padding: "4px 8px" }}>
                    Audio no disponible en el servidor.
                </div>
            )}
            {showButtonRate && <Button style={{marginLeft: "5px", marginTop: "-45px"}} onClick={toogleRate}>{audioRate}x</Button>}
        </>
    );
}
