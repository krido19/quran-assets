color: adzanSettings[name] === 'off' ? 'rgba(255,255,255,0.3)' : 'white'
                                }}
                            >
    { adzanSettings[name] === 'sound' && <i className="fa-solid fa-volume-high"></i> }
{ adzanSettings[name] === 'notification' && <i className="fa-solid fa-bell"></i> }
{ adzanSettings[name] === 'off' && <i className="fa-solid fa-bell-slash"></i> }
                            </button >
                        </div >
                    </div >
                ))}
            </div >
        </div >
    );
}
