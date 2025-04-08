import { useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid';
import { useWebSocket } from './hooks/useWebSocket';

interface Message{
  id:string;
  content:string;
}



function App3() {
  
  const [msgs, setMsgs] = useState<Message[]>([]);
  const inputRef=useRef<HTMLInputElement>(null);


  // useWebSocket() hook 사용해서 웹소켓 연결하기 //192.168.0.107-> 쌤 // localhost-> 나나
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
			}else if(received.type == "leave"){

			}else if(received.type ==="newMessage"){

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
      path:"/chat/send",
      data:{
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
    width:"500px",
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
	}

  return (
    <div>
      <h1>WebSocket 테스트3</h1>
      <h2>WebSocket {connected ? "✅ 연결됨" : "❌ 끊김"}</h2>
			{ isEnter ?
				<>
					<input type="text" ref={inputRef}/>
					<button onClick={handleSend}>전송</button>
					<div style={divStyle} ref={divRef}>
						{msgs.map(item => (
							<div key={item.id}>
								<div style={bubbleStyle}>{item.content}</div>
							</div>
						))}
					</div>	
				</>
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