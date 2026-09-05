import React, { useState, useRef, useEffect } from 'react'
import '../style/chatWidget.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useParams } from 'react-router'

const ChatWidget = () => {
    const [ isOpen, setIsOpen ] = useState(false)
    const [ messages, setMessages ] = useState([])
    const [ input, setInput ] = useState('')
    const [ sending, setSending ] = useState(false)
    const { askQuestion } = useInterview()
    const { interviewId } = useParams()
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [ messages, isOpen ])

    const handleSend = async () => {
        const trimmed = input.trim()
        if (!trimmed || sending) return

        setMessages(prev => [ ...prev, { role: 'user', message: trimmed } ])
        setInput('')
        setSending(true)

        try {
            const answer = await askQuestion(interviewId, trimmed)
            setMessages(prev => [ ...prev, { role: 'assistant', message: answer } ])
        } catch (error) {
            setMessages(prev => [ ...prev, { role: 'assistant', message: "Sorry, something went wrong. Please try again." } ])
        } finally {
            setSending(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <>
            <button className='chat-fab' onClick={() => setIsOpen(o => !o)}>
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                )}
            </button>

            {isOpen && (
                <div className='chat-panel'>
                    <div className='chat-panel__header'>
                        <span>Ask AI about your resume, skills or JD</span>
                    </div>

                    <div className='chat-panel__messages'>
                        {messages.length === 0 && (
                            <p className='chat-panel__empty'>Ask me anything about your resume, the job description, or your skill gaps.</p>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-bubble chat-bubble--${msg.role}`}>
                                {msg.message}
                            </div>
                        ))}
                        {sending && (
                            <div className='chat-bubble chat-bubble--assistant chat-bubble--typing'>
                                <span></span><span></span><span></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className='chat-panel__input'>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder='Type your question...'
                            rows={1}
                        />
                        <button onClick={handleSend} disabled={sending || !input.trim()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default ChatWidget