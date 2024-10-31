// NOTE: One potential issue is that this page was only tested in CST. 
// While this is where we expect most users to use the page (as it is for the UA Waterski team, which is located in CST),
// the page may not work as expected in other time zones. - Lilly Eide


"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './setlist_styles.css'
import Image from 'next/image';
import BlankPfp from '../img/blankpfp.svg';
import { useRouter } from 'next/navigation';
import ReactDOMServer from 'react-dom/server';

interface SetListReservation {
    Date: string;
    Fname: string;
    Lname: string;
    Email: string;
    RegisteredBy: string;
}

interface TeamMember {
    Fname: string;
    Lname: string;
    GradYear: string;
    MemberType: string;
    Major: string;
    PfpImage?: string;
    Email?: string;
    Phone?: string;
}

const Button = ({ onClick, className, children }) => {
    return (
        <button className={className} onClick={onClick}>
            {children}
        </button>
    );
};

function Popup({ children, isOpen, onClose }) {
    return (
        <div className={`popup ${isOpen ? 'open' : ''}`}>
            <div className="popup-content">
                {children}
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

const makeReservation = async (date) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }

        const payload = {
            'reserveDate': date
        };

        await axios.post('http://localhost:4000/auth/setlist', payload, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });

    } catch (error) {
        console.error('Failed to make reservation', error);
        alert("An error occurred when trying to make a reservation. Please refresh the page and try again. If this repeatedly fails, contact the site administrator.");
    } finally {
        window.location.reload();
    }
};

const deleteReservation = async (date) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }

        const payload = {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                'reserveDate': date
            }
        };

        await axios.delete('http://localhost:4000/auth/setlist', payload);

    } catch (error) {
        console.error('Failed to delete reservation', error);
        alert("An error occurred when trying to delete your reservation. Please refresh the page and try again. If this repeatedly fails, contact the site administrator.");
    } finally {
        window.location.reload();
    }
}

function popupContent(info) {
    return (
        <div className="bg-white rounded-lg">
            <div className="p-4">
                <div className="relative w-24 h-24 mb-4 mx-auto">
                    <Image
                        src={info.PfpImage || BlankPfp}
                        alt={`${info.Fname} ${info.Lname}'s profile image`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-full border shadow"
                    />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1 text-center">
                    {info.Fname} {info.Lname}
                </h2>
                <p className="text-gray-700">
                    <strong>Member Type:</strong> {info.MemberType}
                </p>
                <p className="text-gray-700">
                    <strong>Graduation Year:</strong> {info.GradYear}
                </p>
                <p className="text-gray-700">
                    <strong>Major:</strong> {info.Major || 'N/A'}
                </p>
                <p className="text-gray-700">
                    <strong>Email:</strong> {info.Email || 'N/A'}
                </p>
                <p className="text-gray-700">
                    <strong>Phone:</strong> {info.Phone || 'N/A'}
                </p>
            </div>
        </div>
    )
}

function setUserInfo(info) {
    const popupElement = document.getElementById("popupContent") as HTMLDivElement;

    if (popupElement != null) {
        popupElement.innerHTML = ReactDOMServer.renderToString(popupContent(info));
    }
};

const SetListButton = ({ date, reservationState, reservationName, userInfo, setIsPopupOpen }) => {
    const info = userInfo;

    const handleClick = () => {
        if (reservationState === "open" && date >= Date.now()) {
            if (confirm("Reserve slot for " + date.toLocaleString("en-US") + "? Press OK or Yes to continue.")) {
                makeReservation(date.getTime());
            }
        } else if (reservationState === "reservedByYou" && date >= Date.now()) {
            if (confirm("Cancel reservation for " + date.toLocaleString("en-US") + "? Press OK or Yes to continue.")) {
                deleteReservation(date.getTime());
            }
        } else if (reservationState === "reservedBySomeoneElse" || (date < Date.now() && reservationState === "reservedByYou")) {
            setUserInfo(info);
            setIsPopupOpen(true);
        }
    };

    if (date < Date.now()) {
        if (reservationState === "reservedBySomeoneElse") {
            return (
                <div>
                    <Button className="reservedBySomeoneElse" onClick={handleClick}>Past reservation,<br></br>reserved by {reservationName}</Button>
                </div>
            );
        } else if (reservationState === "reservedByYou") {
            return (
                <div>
                    <Button className="reservedBySomeoneElse" onClick={handleClick}>Past reservation,<br></br>reserved by you</Button>
                </div>
            );
        } else {
            return (
                <div>
                    <Button className="pastReservation" onClick={handleClick}>Past reservation,<br></br>cannot register</Button>
                </div>
            );
        }
    } else if (reservationState === "open") {
        return (
            <div>
                <Button className="openReservation" onClick={handleClick}>Slot available.<br></br>Click to reserve</Button>
            </div>
        );
    } else if (reservationState === "reservedByYou") {
        return (
            <div>
                <Button className="reservedByYou" onClick={handleClick}>Slot registered by you.<br></br>Click to cancel</Button>
            </div>
        );
    } else {
        return (
            <div>
                <Button className="reservedBySomeoneElse" onClick={handleClick}>Reserved by<br></br>{reservationName}</Button>
            </div>
        );
    }
};

function getTeamMemberInfo(teamMembers, email) {
    return teamMembers.find(member => member.Email === email) || null;
}

function getReservationInfo(reservations, date) {
    return reservations.find(reservation => new Date(reservation.Date).getTime() === date.getTime()) || null;
}

export default function SetListPage() {
    const [reservations, setReservations] = useState<SetListReservation[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const timesSet = new Set();
    const router = useRouter();

    useEffect(() => {
        document.title = 'UA Waterski - Set List';
    }, []);

    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoggedIn(false);
                router.push('/login-page');
            } else {
                setIsLoggedIn(true);
            }
        };
        checkToken();
    }, [router]);

    useEffect(() => {
        const fetchRoster = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token available');
                }

                const response = await axios.get<TeamMember[]>('http://localhost:4000/auth/roster', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                setTeamMembers(response.data);
            } catch (error) {
                console.error('Failed to fetch team roster:', error);
                router.push('/login-page');
            } finally {
                setLoading(false);
            }
        };

        if (isLoggedIn) {
            fetchRoster();
        }
    }, [isLoggedIn, router]);

    useEffect(() => {
        const fetchSetList = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const response = await axios.get<SetListReservation[]>('http://localhost:4000/auth/setlist', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        startDate: dateRangeStartString,
                        endDate: dateRangeEndString
                    }
                });

                setReservations(response.data);
            } catch (error) {
                console.error('Failed to fetch Reservation', error);
                alert("An error occurred when trying to fetch the Set List.\nPlease refresh the page and try again. If this repeatedly fails, contact the site administrator.");
            } finally {
                setLoading(false);
            }
        };

        if (isLoggedIn) {
            fetchSetList();
        }

    }, [isLoggedIn]);

    function TimeTableBody() {
        let rows = [];

        const currentWeekDropDown = document.getElementById("dateRangeDropDown") as HTMLInputElement;
        if (currentWeekDropDown == null) return;

        const currentWeekStartDate = new Date(Number(currentWeekDropDown.value) * 1000);

        for (let hour = 7; hour <= 17; hour++) {
            for (let minutes = 0; minutes < 60; minutes += 15) {
                if (hour === 17 && minutes !== 0) continue;

                let cells = [];
                const hourString = hour <= 12 ? hour.toString() : (hour - 12).toString();
                const minuteString = minutes === 0 ? minutes.toString() + "0" : minutes.toString();
                const amPMString = hour < 12 ? "am" : "pm";
                const timeString = hourString + ":" + minuteString + amPMString;

                cells.push(<td key={"timeCell_" + hour + "_" + minutes} className="timeCell">{timeString}</td>);

                for (let day = 0; day <= 6; day++) {
                    const thisButtonDate = new Date(new Date(currentWeekStartDate).setDate(currentWeekStartDate.getDate() + day));
                    thisButtonDate.setHours(hour, minutes, 0, 0);

                    if (timesSet.has(thisButtonDate.getTime())) {
                        const reservation = getReservationInfo(reservations, thisButtonDate);
                        if (reservation) {
                            const userInfo = getTeamMemberInfo(teamMembers, reservation.Email);
                            const state = reservation.RegisteredBy === "you" ? "reservedByYou" : "reservedBySomeoneElse";
                            const name = reservation.Fname + " " + reservation.Lname;
                            cells.push(<td key={day + "_" + hour + "_" + minutes}><SetListButton date={thisButtonDate} reservationState={state} reservationName={name} userInfo={userInfo} setIsPopupOpen={setIsPopupOpen} /></td>);
                        }
                    } else {
                        cells.push(<td key={day + "_" + hour + "_" + minutes}><SetListButton date={thisButtonDate} reservationState="open" reservationName="" userInfo={null} setIsPopupOpen={setIsPopupOpen} /></td>);
                    }
                }

                rows.push(<tr key={"row_" + hour + "_" + minutes}>{cells}</tr>);
            }
        }

        return <tbody>{rows}</tbody>;
    }

    function TimeTable() {
        return (
            <table id="setListTable">
                <thead>
                    <tr>
                        <th className="timeCell">Time</th>
                        <th>Sunday</th>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                        <th>Saturday</th>
                    </tr>
                </thead>
                {TimeTableBody()}
            </table>
        );
    }

    const TimeTableWithDropDown = ({ values, labels }) => {
        if (!values || !labels) return;

        let options = [];
        for (let i = 0; i < values.length; i++) {
            options.push([values[i], labels[i]]);
        }
        const [selectedOption, setSelectedOption] = useState(options[2][0]);
        return (
            <div id="timeTableDiv">
                <select
                    id="dateRangeDropDown"
                    value={selectedOption}
                    onChange={e => setSelectedOption(e.target.value)}>
                    {options.map(o => (
                        <option key={o[0]} value={o[0]}>{o[1]}</option>
                    ))}
                </select>
                {TimeTable()}
            </div>
        );
    };

    function TimeTableInit() {
        const today = new Date();
        const weekRange = 2;
        let dateRanges = [];
        let values = [];
        let labels = [];

        const thisWeekSunday = new Date();
        thisWeekSunday.setDate(today.getDate() - today.getDay());

        for (let i = 0; i < (weekRange * 2) + 1; i++) {
            dateRanges.push([new Date(), new Date()]);
            dateRanges[i][0].setDate(today.getDate() - today.getDay() + (7 * (i - weekRange)));
            dateRanges[i][1].setDate(today.getDate() - today.getDay() + (7 * (i - weekRange)) + 6);
            labels.push(dateRanges[i][0].toLocaleDateString("en-US") + " - " + dateRanges[i][1].toLocaleDateString("en-US"));
            values.push(dateRanges[i][0].getTime() / 1000);
        }

        return <TimeTableWithDropDown values={values} labels={labels} />;
    }

    const todayDate = new Date();
    const dateRangeStart = new Date();
    dateRangeStart.setDate(todayDate.getDate() - todayDate.getDay() - 14);
    const dateRangeEnd = new Date();
    dateRangeEnd.setDate(todayDate.getDate() - todayDate.getDay() + 20);

    const dateRangeStartString = `${dateRangeStart.getFullYear()}-${(dateRangeStart.getMonth() + 1)}-${dateRangeStart.getDate()} 00:00:00`;
    const dateRangeEndString = `${dateRangeEnd.getFullYear()}-${(dateRangeEnd.getMonth() + 1)}-${dateRangeEnd.getDate()} 23:59:59`;

    if (loading) {
        return <div className="text-black">Loading...</div>;
    }

    reservations.forEach(reservation => {
        timesSet.add(new Date(reservation.Date).getTime());
    });

    return (
        <div className="relative bg-white rounded-[5px] pageContent">
            <div>
                <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
                    <div id='popupContent'>
                        Popup info here.
                    </div>
                </Popup>
            </div>
            {TimeTableInit()}
        </div>
    );
}
