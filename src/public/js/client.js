
import h from './functions.js';

window.addEventListener( 'load', () => {
    const room = h.getQString( location.href, 'room' );
    const username = sessionStorage.getItem( 'username' );

    // checks for the existence of two values: "room" and "username" to make the element visible
    if ( !room ) {
        document.querySelector( '#room-create' ).attributes.removeNamedItem( 'hidden' );
    }

    else if ( !username ) {
        document.querySelector( '#username-set' ).attributes.removeNamedItem( 'hidden' );
    }

    else {
        let commElement = document.getElementsByClassName( 'room-comm' );

        // make elements visible
        for ( let i = 0; i < commElement.length; i++ ) {
            commElement[i].attributes.removeNamedItem( 'hidden' );
        }

        var pc = [];

        let socket = io( '/stream' );

        var socketId = '';
        var randomNumber = `__${h.genRandStr()}__${h.genRandStr()}__`;
        var My_Stream = '';
        var screen = '';
        var recordedStream = [];
        var record_media = '';

        //Get user video by default
        UserStream();


        socket.on( 'connect', () => {
            //set socketId
            socketId = socket.io.engine.id;
            document.getElementById('randomNumber').innerText = randomNumber;


            socket.emit( 'subscribe', {
                room: room,
                socketId: socketId
            } );


            socket.on( 'new user', ( data ) => {
                socket.emit( 'newUserStart', { to: data.socketId, sender: socketId } );
                pc.push( data.socketId );
                // the members of the room creates an offer to the new user and add him
                init_user( true, data.socketId );
            } );


            socket.on( 'newUserStart', ( data ) => {
                pc.push( data.sender );
                // the new user add room users 
                init_user( false, data.sender );
            } );


            socket.on( 'ice candidates', async ( data ) => {
                data.candidate ? await pc[data.sender].addIceCandidate( new RTCIceCandidate( data.candidate ) ) : '';
            } );


            socket.on( 'sdp', async ( data ) => {
                if ( data.description.type === 'offer' ) {
                    data.description ? await pc[data.sender].setRemoteDescription( new RTCSessionDescription( data.description ) ) : '';

                    h.get_User_Media().then( async ( stream ) => {
                        if ( !document.getElementById( 'local' ).srcObject ) {
                            h.stream_local( stream );
                        }

                        //save my stream
                        My_Stream = stream;

                        stream.getTracks().forEach( ( track ) => {
                            pc[data.sender].addTrack( track, stream );
                        } );

                        let answer = await pc[data.sender].createAnswer();

                        await pc[data.sender].setLocalDescription( answer );

                        socket.emit( 'sdp', { description: pc[data.sender].localDescription, to: data.sender, sender: socketId } );
                    } ).catch( ( e ) => {
                        console.error( e );
                    } );
                }

                else if ( data.description.type === 'answer' ) {
                    await pc[data.sender].setRemoteDescription( new RTCSessionDescription( data.description ) );
                }
            } );


            socket.on( 'chat', ( data ) => {
                h.Add_Chat( data, 'remote' );
            } );
        } );


        function UserStream() {
            h.get_User_Media().then( ( stream ) => {
                //save my stream
                My_Stream = stream;

                h.stream_local( stream );
            } ).catch( ( e ) => {
                console.error( `stream error: ${ e }` );
            } );
        }


        function send_message( msg ) {
            let data = {
                room: room,
                msg: msg,
                sender: `${username} (${randomNumber})`
            };

            //emit chat message
            socket.emit( 'chat', data );

            //add localchat
            h.Add_Chat( data, 'local' );
        }



        function init_user( createOffer, roommate_name ) {
            pc[roommate_name] = new RTCPeerConnection( h.getIceServer() );

            if ( screen && screen.getTracks().length ) {
                screen.getTracks().forEach( ( track ) => {
                    pc[roommate_name].addTrack( track, screen );//should trigger negotiationneeded event
                } );
            }

            else if ( My_Stream ) {
                My_Stream.getTracks().forEach( ( track ) => {
                    pc[roommate_name].addTrack( track, My_Stream );//should trigger negotiationneeded event
                } );
            }

            else {
                h.get_User_Media().then( ( stream ) => {
                    //save my stream
                    My_Stream = stream;

                    stream.getTracks().forEach( ( track ) => {
                        pc[roommate_name].addTrack( track, stream );//should trigger negotiationneeded event
                    } );

                    h.stream_local( stream );
                } ).catch( ( e ) => {
                    console.error( `stream error: ${ e }` );
                } );
            }



            //create offer
            if ( createOffer ) {
                pc[roommate_name].onnegotiationneeded = async () => {
                    let offer = await pc[roommate_name].createOffer();

                    await pc[roommate_name].setLocalDescription( offer );

                    socket.emit( 'sdp', { description: pc[roommate_name].localDescription, to: roommate_name, sender: socketId } );
                };
            }



            //send ice candidate to partnerNames
            pc[roommate_name].onicecandidate = ( { candidate } ) => {
                socket.emit( 'ice candidates', { candidate: candidate, to: roommate_name, sender: socketId } );
            };



            //add user video
            pc[roommate_name].ontrack = ( e ) => {
                let str = e.streams[0];
                if ( document.getElementById( `${ roommate_name }-video` ) ) {
                    document.getElementById( `${ roommate_name }-video` ).srcObject = str;
                }

                else {
                    //video elem
                    let new_video = document.createElement( 'video' );
                    new_video.id = `${ roommate_name }-video`;
                    new_video.srcObject = str;
                    new_video.autoplay = true;
                    new_video.className = 'remote-video';

                    //video controls elements
                    let control_div = document.createElement( 'div' );
                    control_div.className = 'remote-video-controls';
                    control_div.innerHTML = `<i class="fa fa-microphone text-white pr-3 mute-remote-mic" title="Mute"></i>
                        <i class="fa fa-expand text-white expand-remote-video" title="Expand"></i>`;

                    //create a new div for card
                    let new_card_div = document.createElement( 'div' );
                    new_card_div.className = 'card card-sm';
                    new_card_div.id = roommate_name;
                    new_card_div.appendChild( new_video );
                    new_card_div.appendChild( control_div );

                    //put div in main-section elem
                    document.getElementById( 'videos' ).appendChild( new_card_div );

                    h.adjust_Size();
                }
            };



            pc[roommate_name].onconnectionstatechange = ( d ) => {
                switch ( pc[roommate_name].iceConnectionState ) {
                    case 'disconnected':
                    case 'failed':
                        h.closeVideo( roommate_name );
                        break;

                    case 'closed':
                        h.closeVideo( roommate_name );
                        break;
                }
            };



            pc[roommate_name].onsignalingstatechange = ( d ) => {
                switch ( pc[roommate_name].signalingState ) {
                    case 'closed':
                        console.log( "Signalling state is 'closed'" );
                        h.closeVideo( roommate_name );
                        break;
                }
            };
        }



        function screen_share() {
            h.screen_share().then( ( stream ) => {
                h.toggle_share_icons( true );

                //disable the video toggle btns while sharing screen. This is to ensure clicking on the btn does not interfere with the screen sharing
                //It will be enabled was user stopped sharing screen
                h.toggle_video_button_disabled( true );

                //save my screen stream
                screen = stream;

                //share the new stream with all partners
                New_tracks_to_broadcast( stream, 'video', false );

                //When the stop sharing button shown by the browser is clicked
                screen.getVideoTracks()[0].addEventListener( 'ended', () => {
                    stop_screen_share();
                } );
            } ).catch( ( e ) => {
                console.error( e );
            } );
        }



        function stop_screen_share() {
            //enable video toggle btn
            h.toggle_video_button_disabled( false );

            return new Promise( ( res, rej ) => {
                screen.getTracks().length ? screen.getTracks().forEach( track => track.stop() ) : '';

                res();
            } ).then( () => {
                h.toggle_share_icons( false );
                New_tracks_to_broadcast( My_Stream, 'video' );
            } ).catch( ( e ) => {
                console.error( e );
            } );
        }



        function New_tracks_to_broadcast( stream, type, mirrorMode = true ) {
            h.stream_local( stream, mirrorMode );

            let track = type == 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];

            for ( let p in pc ) {
                let pName = pc[p];
                /*This is an important check because if the property value is not an object, 
                it will cause an error when trying to call the track_replace function, 
                which expects an RTCPeerConnection object as an argument.*/
                if ( typeof pc[pName] == 'object' ) {
                    h.track_replace( track, pc[pName] );
                }
            }
        }


        function toggle_recording_icons( isRecording ) {
            let e = document.getElementById( 'record' );

            if ( isRecording ) {
                e.setAttribute( 'title', 'Stop recording' );
                e.children[0].classList.add( 'text-danger' );
                e.children[0].classList.remove( 'text-white' );
            }

            else {
                e.setAttribute( 'title', 'Record' );
                e.children[0].classList.add( 'text-white' );
                e.children[0].classList.remove( 'text-danger' );
            }
        }


        function record_start( stream ) {
            record_media = new MediaRecorder( stream, {
                mimeType: 'video/webm;codecs=vp9'
            } );

            record_media.start( 1000 );
            toggle_recording_icons( true );

            record_media.ondataavailable = function ( e ) {
                recordedStream.push( e.data );
            };

            record_media.onstop = function () {
                toggle_recording_icons( false );

                h.save_stream_recorded( recordedStream, username );

                setTimeout( () => {
                    recordedStream = [];
                }, 3000 );
            };

            record_media.onerror = function ( e ) {
                console.error( e );
            };
        }

        document.getElementById('chat-input-btn').addEventListener('click',(e) => {
            console.log("here: ",document.getElementById('chat-input').value)
            if (  document.getElementById('chat-input').value.trim()  ) {
                send_message( document.getElementById('chat-input').value );

                setTimeout( () => {
                    document.getElementById('chat-input').value = '';
                }, 50 );
            }
        });

        //Chat textarea
        document.getElementById( 'chat-input' ).addEventListener( 'keypress', ( e ) => {
            if ( e.which === 13 && ( e.target.value.trim() ) ) {
                e.preventDefault();

                send_message( e.target.value );

                setTimeout( () => {
                    e.target.value = '';
                }, 50 );
            }
        } );


        //When the video icon is clicked
        document.getElementById( 'toggle-video' ).addEventListener( 'click', ( e ) => {
            e.preventDefault();

            let elem = document.getElementById( 'toggle-video' );

            if ( My_Stream.getVideoTracks()[0].enabled ) {
                e.target.classList.remove( 'fa-video' );
                e.target.classList.add( 'fa-video-slash' );
                elem.setAttribute( 'title', 'Show Video' );

                My_Stream.getVideoTracks()[0].enabled = false;
            }

            else {
                e.target.classList.remove( 'fa-video-slash' );
                e.target.classList.add( 'fa-video' );
                elem.setAttribute( 'title', 'Hide Video' );

                My_Stream.getVideoTracks()[0].enabled = true;
            }

            New_tracks_to_broadcast( My_Stream, 'video' );
        } );


        //When the mute icon is clicked
        document.getElementById( 'toggle-mute' ).addEventListener( 'click', ( e ) => {
            e.preventDefault();

            let elem = document.getElementById( 'toggle-mute' );

            if ( My_Stream.getAudioTracks()[0].enabled ) {
                e.target.classList.remove( 'fa-microphone-alt' );
                e.target.classList.add( 'fa-microphone-alt-slash' );
                elem.setAttribute( 'title', 'Unmute' );

                My_Stream.getAudioTracks()[0].enabled = false;
            }

            else {
                e.target.classList.remove( 'fa-microphone-alt-slash' );
                e.target.classList.add( 'fa-microphone-alt' );
                elem.setAttribute( 'title', 'Mute' );

                My_Stream.getAudioTracks()[0].enabled = true;
            }

            New_tracks_to_broadcast( My_Stream, 'audio' );
        } );


        //When user clicks the 'Share screen' button
        document.getElementById( 'share-screen' ).addEventListener( 'click', ( e ) => {
            e.preventDefault();

            if ( screen && screen.getVideoTracks().length && screen.getVideoTracks()[0].readyState != 'ended' ) {
                stop_screen_share();
            }

            else {
                screen_share();
            }
        } );


        //When record button is clicked
        document.getElementById( 'record' ).addEventListener( 'click', ( e ) => {
            /**
             * Ask user what they want to record.
             * Get the stream based on selection and start recording
             */
            if ( !record_media || record_media.state == 'inactive' ) {
                h.toggle_modal( 'recording-options-modal', true );
            }

            else if ( record_media.state == 'paused' ) {
                record_media.resume();
            }

            else if ( record_media.state == 'recording' ) {
                record_media.stop();
            }
        } );


        //When user choose to record screen
        document.getElementById( 'record-screen' ).addEventListener( 'click', () => {
            h.toggle_modal( 'recording-options-modal', false );

            if ( screen && screen.getVideoTracks().length ) {
                record_start( screen );
            }

            else {
                h.screen_share().then( ( screenStream ) => {
                    record_start( screenStream );
                } ).catch( () => { } );
            }
        } );


        //When user choose to record own video
        document.getElementById( 'record-video' ).addEventListener( 'click', () => {
            h.toggle_modal( 'recording-options-modal', false );

            if ( My_Stream && My_Stream.getTracks().length ) {
                record_start( My_Stream );
            }

            else {
                h.get_User_Media().then( ( videoStream ) => {
                    record_start( videoStream );
                } ).catch( () => { } );
            }
        } );
    }
} );
