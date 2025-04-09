import { useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid';
import { useWebSocket } from './hooks/useWebSocket';
import { Button, Form, InputGroup } from 'react-bootstrap';

interface Message{
  id:string;
  content:string;
}



function App3() {
  
  const [msgs, setMsgs] = useState<Message[]>([]);
  const inputRef=useRef<HTMLInputElement>(null);
  //대화방에 입장한 userName도 상태값으로 관리하기
  const [userName, setUserName] = useState<string>();
  //대화방 참여자 목록도 상태값으로 관리
  const [userList, setUserList] = useState<string[]>([]);

  //192.168.0.107-> 쌤 // localhost-> 나나  // 페이지는 나한테 + 웹소켓연결은 선생님꺼!
  // useWebSocket() hook 사용해서 웹소켓 연결하기
  const {sendMessage, connected} = useWebSocket("ws://192.168.0.107:9000/ws", {
    onOpen:()=>{
      console.log("연결됨!");
    },
    onMessage:(event)=>{
			//응답된 json 문자열을 실제 object로 변경한다.
			const received = JSON.parse(event.data);
			if(received.type === "enter"){
					setIsEnter(true);

					setMsgs(prevState=>{
						const msg = received.payload.userName+"님이 입장했습니다.";
						return [...prevState, {id:uuid(), content:msg}]
					});
          //사용자 목록을 update한다.
          setUserList(received.payload.userList);

			}else if(received.type == "leave"){
        const msg = received.payload.userName+" 님이 퇴장했습니다.";
        setMsgs(prevState=>[...prevState, {id:uuid(), content:msg}]);
        //leave 된 userName을 userList에서 제거한다. //퇴장한 사람들 리스트에서 제거하기!
        //prevState쓰는 이유는 이전상태값에서 필터링한 새로운 배열리턴 => userList는 비어있어서 이전상태값에서 가져오는것
        setUserList(prevState => prevState.filter(item => item !== received.payload.userName))


			}else if(received.type ==="public"){ //대화하는거인듯: 누가어떤문자열을 구성했는지 모든사람들에게 보냄!
        setMsgs(prevState=>{
          //출력할 메세지를 구성한다. //누가 어떤메세지를 보냈는지 문자열 구성
          const msg = `${received.payload.userName} : ${received.payload.text}`;
          //배열에 담아서 리턴 //새로운오브젝트를 추가해서 배열을 리턴
          return [...prevState, {id:uuid(), content:msg}];
        });
			}
    },
    onClose:()=>{
      console.log("연결끊김!");
    }
  });
  

  const handleSend=()=>{
    //입력한 메세지 읽어와서
    const msg=inputRef.current?.value;
    //서버에 전송할 정보를 담고 있는 object
    const obj={
      path:"/chat/public",
      data:{
        userName, //userName:userName 을 줄여쓴것! 
        text:msg
      }
    };

    //object를 json문자열로 변환해서 전송하기
    sendMessage(JSON.stringify(obj));
    //입력창 초기화
    inputRef.current!.value="";
  }
  const divStyle={
    height:"300px",
    backgroundColor:"#cecece",
    padding:"10px",
    overflowY:"auto",
    scrollBehavior:"smooth"
  };
  const divRef=useRef<HTMLDivElement>(null);
  //자동 스크롤
  useEffect(()=>{
		if(divRef.current){
    	divRef.current!.scrollTop = divRef.current!.scrollHeight;
		}
  }, [msgs]);

  //풍선스타일
  const bubbleStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "8px 12px",
    marginBottom: "8px",
    display: "inline-block",
    maxWidth: "80%",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
  };

	//대화방에 입장했는지 여부
	const [isEnter, setIsEnter] = useState<boolean>(false);

	const inputUserRef = useRef<HTMLInputElement>(null);
	const handleEnter = ()=>{
		const obj={
			path:"/chat/enter", 
			data:{
				userName:inputUserRef.current?.value 
			}
		};
		sendMessage(JSON.stringify(obj));
    //userName을 상태값에 넣어주기
    setUserName(obj.data.userName);

	}


  return (
    <div className='container'>
      <h1>WebSocket 테스트3</h1>
      <h2>WebSocket {connected ? "✅ 연결됨" : "❌ 끊김"} {userName}</h2>
			{ isEnter ?
				<div className='row'>
          <div className='col-8'>
            <div style={divStyle} ref={divRef}>
              {msgs.map(item => (
                <div key={item.id}>
                  <div style={bubbleStyle}>{item.content}</div>
                </div>
              ))}
            </div>
            <InputGroup className="mb-3">
            <Form.Control placeholder="대화입력..." ref={inputRef}/>
            <Button variant="outline-secondary" onClick={handleSend}>Send </Button>
          </InputGroup>

          </div>
          <div className='col-4'>
              <h3>참여자 목록</h3>
              <ul>
                {userList.map(item => 
                  <li key={item}>
                    <button>{item}</button>
                  </li>
                )}
              </ul>
          </div>
				</div>
				:
				<>
					<input ref={inputUserRef} type="text" placeholder='UserName 입력...' />
					<button onClick={handleEnter}>입장</button>
				</>
			}
    </div>
  )
}

export default App3