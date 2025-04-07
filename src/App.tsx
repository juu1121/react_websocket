import { useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid';

interface Message{
  id:string;
  content:string;
}

function App() {

  
  const socketRef=useRef<WebSocket|null>(null);

  const [msgs, setMsgs] = useState<Message[]>([]);
  useEffect(()=>{
    //컨포넌트가 활성화 되는 시점에 웹소캣 접속하기기
    const socket=new WebSocket("ws://localhost:9000/ws"); //해당경로로 웹소켓연결요청
    //socket=new WebSocket("ws://192.168.0.107:9000/ws"); //쌤꺼..? 
    
    //생성된 WebSocket의 참조값을 socketRef에 저장해두기
    socketRef.current = socket;
    socket.onopen = ()=>{
      socket.send("hi spring boot!");
    };
    
    // 서버에서 메세지가 도착하면 실행할 함수 등록
    socket.onmessage = (event)=>{
      //콘솔창에 서버가 보낸 메세지가 출력 //웹소켓에 메세지가 도착했을때, 서버가 클라이언트에게 보낸게 여기로 도착 
      console.log(event.data);
      /*
        useEffect()함수 안에서 이전 상태값을 사용하면서 상태값을 변경할때는
        setState((prevState)=>{}) 형식으로 변경해야 한다
        setState((prevState)=>{
          여기서 prevState값을 이용해서 새로운 상태값을 만들어서 리턴해주면된다.
        }) 
      */
      setMsgs((prevState)=>{
        return [...prevState, {id:uuid(), content:event.data}];
      });
    };
  }, []);

  const inputRef=useRef<HTMLInputElement>(null);
  const handleSend=()=>{
    //입력한 메세지 읽어와서
    const msg = inputRef.current?.value;
    //전송하기
    socketRef.current?.send(msg);
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
  const divRef = useRef<HTMLDivElement>(null);
  //자동으로 아래쪽으로 스크롤
  useEffect(()=>{
    divRef.current!.scrollTop = divRef.current!.scrollHeight;
  }, [msgs]);

  return ( 
    <div>
      <h1>webSocket 테스트</h1>
      <input type="text" ref={inputRef}/>
      <button onClick={handleSend}>전송</button>
      <div style={divStyle} ref={divRef}>
        {msgs.map(item=><p key={item.id}>{item.content}</p>)}
      </div>
    </div>
  )
}

export default App
