"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useChat } from "ai/react";

export default function Page() {

    const chatParent = useRef(null)

    let { messages, input, handleInputChange, handleSubmit } = useChat({
     
      api: 'api/ai/chatbot',
   
      onError: (e) => {
          console.log(e)
      }
      
  });

  console.log(messages)


      useEffect(() => {
        const domNode = chatParent.current
        if (domNode) {
            domNode.scrollTop = domNode.scrollHeight
        }
    })
  
    
  return (
    <main className="flex flex-col w-full h-screen max-h-dvh bg-gray-800">

    <div className='flex h-[90%] w-full'>

        <div className=' flex flex-col h-full w-full overflow-hidden'>


            <section className="w-full h-full bg-gray-800 px-0 pb-10 flex flex-col flex-grow gap-4 mx-auto">
                <ul ref={chatParent} className="h-1 p-4 flex-grow bg-muted/50 overflow-y-auto flex flex-col">
    
                    {(messages?.length >0) ? 
                        <>
                            {messages.map((elm,index) =>
                                
                                <div key={index} className={`flex flex-col space-y-4 p-3 rounded-xl w-full items-start ${(index %2 ===0) ? "bg-slate-700" : "bg-slate-600"}`}>

                                  
                                    {
                                        (index %2 ===0) ? 
                                        <span className='text-xs'>
                                            User
                                        </span>
                                         :<span className='text-xs'>
                                            Ai
                                        </span>
                                    }
                                    

                                    <div className={`w-3/4 text-xs`}>
                                        <p>{elm.content}</p>
                                    </div>
                                </div>              
                            )}    
                        </>
                        : null
                    }
                </ul>
            </section>

            <form onSubmit={handleSubmit} className='flex mt-2 space-x-5 w-full p-4'>
                <input 
                    autoFocus
                    className='rounded-lg bg-gray-800 border-2 border-gray-600 w-5/6 py-3 pl-3  text-xs text-gray-500 placeholder-gray-500'
                    placeholder='enter text input' value={input} onChange={handleInputChange} type='text'/>
                <button type="submit" className=' bg-sky-600 hover:opacity-60 active:opacity-60 rounded-xl text-sm w-1/6'>
                    Submit
                </button>
            </form>
            
                
            

        </div>

    </div>
    
</main>
  )
}
