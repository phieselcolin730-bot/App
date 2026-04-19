'use client'

import React, { useState, useEffect } from 'react'
import { animate } from '@/app/animate-api'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/lib/translations'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface CallInterfaceProps {
  language: string
  contactName: string
  contactAvatar: string
  onEnd: () => void
  onHaptic: (duration?: number) => void
  onBatteryKill?: () => void
}

interface CallMessage {
  id: string
  text: string
  isContact: boolean
  timestamp: Date
}

type CallState = 'connecting' | 'ringing' | 'answered' | 'talking' | 'ended'

// Contact personalities and responses
const CONTACT_RESPONSES: Record<string, { 
  answerDelay: number, 
  greeting: Record<string, string>,
  responses: Record<string, string[]>
}> = {
  'Mom 👩‍💼': {
    answerDelay: 2000,
    greeting: {
      'English': 'Hello sweetie! How are you doing?',
      'Español': '¡Hola cariño! ¿Cómo estás?',
      'Français': 'Bonjour mon chéri! Comment ça va?',
      'Deutsch': 'Hallo Schatz! Wie geht es dir?',
      '日本語': 'こんにちは、お疲れ様！元気？',
      '한국어': '안녕 얘야! 잘 지내고 있어?',
      '中文': '你好宝贝！你好吗？'
    },
    responses: {
      'English': [
        'That sounds wonderful, honey!',
        'I\'m so proud of you!',
        'Remember to eat well and get enough sleep.',
        'I love you so much!',
        'Call me more often, okay?'
      ],
      'Español': [
        '¡Eso suena maravilloso, cariño!',
        '¡Estoy muy orgullosa de ti!',
        'Recuerda comer bien y dormir lo suficiente.',
        '¡Te amo mucho!',
        'Llámame más seguido, ¿sí?'
      ],
      'Français': [
        'Ça sonne merveilleux, mon chéri!',
        'Je suis si fière de toi!',
        'N\'oublie pas de bien manger et de dormir suffisamment.',
        'Je t\'aime tellement!',
        'Appelle-moi plus souvent, d\'accord?'
      ],
      'Deutsch': [
        'Das klingt wunderbar, Schatz!',
        'Ich bin so stolz auf dich!',
        'Vergiss nicht, gut zu essen und genug zu schlafen.',
        'Ich liebe dich so sehr!',
        'Ruf mich öfter an, okay?'
      ],
      '日本語': [
        'それは素晴らしいね！',
        'あなたを誇りに思うよ！',
        'しっかり食べて、よく眠ってね。',
        '本当に愛してるよ！',
        'もっと頻繁に電話してね！'
      ],
      '한국어': [
        '정말 좋은 일이네!',
        '너를 정말 자랑스러워해!',
        '잘 먹고 충분히 자도록 해.',
        '정말 사랑한다!',
        '더 자주 전화해, 알았지?'
      ],
      '中文': [
        '听起来很棒，宝贝！',
        '我为你感到骄傲！',
        '记得要好好吃饭，充足睡眠。',
        '我很爱你！',
        '要经常给我打电话，好吗？'
      ]
    }
  },
  
  'Dad 👨‍💻': {
    answerDelay: 3000,
    greeting: {
      'English': 'Hey kiddo! What\'s up? Working on anything interesting?',
      'Español': '¡Oye pequeño! ¿Qué tal? ¿Trabajando en algo interesante?',
      'Français': 'Salut mon enfant! Quoi de neuf? Tu travailles sur quelque chose d\'intéressant?',
      'Deutsch': 'Hey Kleines! Was geht ab? Arbeitest du an etwas Interessantem?',
      '日本語': 'やあ！調子はどう？何か面白いことやってる？',
      '한국어': '안녕! 어떻게 지내? 재미있는 일 하고 있어?',
      '中文': '嘿孩子！怎么样？在做什么有趣的事吗？'
    },
    responses: {
      'English': [
        'That\'s really cool! Tell me more about it.',
        'I\'m always here if you need any tech advice.',
        'You\'re getting so good at this stuff!',
        'Want to grab lunch this weekend?',
        'Keep up the great work!'
      ],
      'Español': [
        '¡Eso es genial! Cuéntame más al respecto.',
        'Siempre estoy aquí si necesitas consejo técnico.',
        '¡Te estás volviendo muy bueno en esto!',
        '¿Quieres almorzar este fin de semana?',
        '¡Sigue con el excelente trabajo!'
      ],
      'Français': [
        'C\'est vraiment cool! Raconte-moi en plus.',
        'Je suis toujours là si tu as besoin de conseils techniques.',
        'Tu deviens vraiment bon dans ce domaine!',
        'Tu veux déjeuner ce week-end?',
        'Continue ce excellent travail!'
      ],
      'Deutsch': [
        'Das ist wirklich cool! Erzähl mir mehr darüber.',
        'Ich bin immer da, wenn du technische Beratung brauchst.',
        'Du wirst richtig gut in dem Zeug!',
        'Willst du am Wochenende mittagessen?',
        'Mach weiter so!'
      ],
      '日本語': [
        'それは本当にクールだね！もっと教えて。',
        '技術的なアドバイスが必要な時はいつでも頼って。',
        'この分野で本当に上手になってるね！',
        '今度の週末、昼食でも食べない？',
        '素晴らしい仕事を続けて！'
      ],
      '한국어': [
        '정말 멋지다! 더 자세히 말해봐.',
        '기술적인 조언이 필요하면 언제든 말해.',
        '이런 일에 정말 능숙해지고 있어!',
        '이번 주말에 점심 먹을래?',
        '계속 좋은 일해!'
      ],
      '中文': [
        '真的很酷！告诉我更多。',
        '如果你需要技术建议，我随时都在。',
        '你在这方面越来越厉害了！',
        '这个周末想一起吃午饭吗？',
        '继续保持出色的工作！'
      ]
    }
  },
  
  'Alex 🎮': {
    answerDelay: 1500,
    greeting: {
      'English': 'Yooo! What\'s good bro? Ready to game?',
      'Español': '¡Ey! ¿Qué tal hermano? ¿Listo para jugar?',
      'Français': 'Salut! Quoi de beau mec? Prêt à jouer?',
      'Deutsch': 'Yooo! Was geht ab Bro? Bereit zum Spielen?',
      '日本語': 'よう！調子どう？ゲームする？',
      '한국어': '야! 뭐해? 게임할 준비됐어?',
      '中文': '嗨！怎么样兄弟？准备游戏了吗？'
    },
    responses: {
      'English': [
        'Dude, you HAVE to try this new game!',
        'I just got a sick new setup!',
        'Want to hop on later tonight?',
        'I\'m streaming later if you want to watch!',
        'This game is absolutely insane!'
      ],
      'Español': [
        '¡Hermano, TIENES que probar este nuevo juego!',
        '¡Acabo de conseguir una configuración increíble!',
        '¿Quieres conectarte más tarde esta noche?',
        '¡Voy a hacer streaming más tarde si quieres ver!',
        '¡Este juego es absolutamente loco!'
      ],
      'Français': [
        'Mec, tu DOIS essayer ce nouveau jeu!',
        'Je viens d\'avoir une nouvelle config de malade!',
        'Tu veux te connecter plus tard ce soir?',
        'Je fais du streaming plus tard si tu veux regarder!',
        'Ce jeu est absolument dingue!'
      ],
      'Deutsch': [
        'Mann, du MUSST dieses neue Spiel ausprobieren!',
        'Ich hab gerade ein krankes neues Setup bekommen!',
        'Willst du später heute Abend online kommen?',
        'Ich streame später, falls du zuschauen willst!',
        'Dieses Spiel ist absolut verrückt!'
      ],
      '日本語': [
        'マジで、この新しいゲーム試してみて！',
        'ヤバい新しいセットアップ手に入れた！',
        '今夜後で一緒にやらない？',
        '後でストリーミングするから見たければ！',
        'このゲーム本当にヤバい！'
      ],
      '한국어': [
        '진짜, 이 새 게임 해봐야 해!',
        '방금 미친 새 셋업 샀어!',
        '오늘 밤 늦게 같이 할래?',
        '나중에 스트리밍할 거야, 보고 싶으면!',
        '이 게임 진짜 미쳤어!'
      ],
      '中文': [
        '兄弟，你一定要试试这个新游戏！',
        '我刚弄了个超棒的新装备！',
        '今晚晚些时候想一起玩吗？',
        '我晚点会直播，想看的话！',
        '这个游戏绝对疯狂！'
      ]
    }
  },
  
  'Sarah 📚': {
    answerDelay: 2500,
    greeting: {
      'English': 'Hi there! Thanks for calling. How can I help?',
      'Español': '¡Hola! Gracias por llamar. ¿Cómo puedo ayudar?',
      'Français': 'Salut! Merci d\'appeler. Comment puis-je aider?',
      'Deutsch': 'Hallo! Danke für den Anruf. Wie kann ich helfen?',
      '日本語': 'こんにちは！電話ありがとう。どうしたの？',
      '한국어': '안녕! 전화해줘서 고마워. 어떻게 도와줄까?',
      '中文': '你好！谢谢你的电话。我能帮什么忙吗？'
    },
    responses: {
      'English': [
        'That project was really challenging, but we did it!',
        'I found some great resources for our research.',
        'Have you finished reading that book I recommended?',
        'We should schedule our study session soon.',
        'I\'m so excited about our next presentation!'
      ],
      'Español': [
        '¡Ese proyecto fue muy desafiante, pero lo logramos!',
        'Encontré algunos recursos geniales para nuestra investigación.',
        '¿Ya terminaste de leer ese libro que te recomendé?',
        'Deberíamos programar nuestra sesión de estudio pronto.',
        '¡Estoy muy emocionada por nuestra próxima presentación!'
      ],
      'Français': [
        'Ce projet était vraiment difficile, mais on l\'a fait!',
        'J\'ai trouvé d\'excellentes ressources pour nos recherches.',
        'As-tu fini de lire ce livre que j\'ai recommandé?',
        'On devrait programmer notre session d\'étude bientôt.',
        'Je suis si excitée pour notre prochaine présentation!'
      ],
      'Deutsch': [
        'Das Projekt war wirklich herausfordernd, aber wir haben es geschafft!',
        'Ich habe tolle Ressourcen für unsere Forschung gefunden.',
        'Hast du das Buch fertig gelesen, das ich empfohlen habe?',
        'Wir sollten bald unsere Lernsession planen.',
        'Ich bin so aufgeregt wegen unserer nächsten Präsentation!'
      ],
      '日本語': [
        'あのプロジェクトは本当に大変だったけど、やり遂げたね！',
        '研究のための素晴らしい資料を見つけたよ。',
        'おすすめした本、読み終えた？',
        '勉強会の予定、そろそろ決めようか。',
        '次のプレゼンテーション、とても楽しみ！'
      ],
      '한국어': [
        '그 프로젝트는 정말 어려웠지만, 해냈어!',
        '우리 연구를 위한 좋은 자료들을 찾았어.',
        '내가 추천한 책 다 읽었어?',
        '곧 스터디 세션 일정을 잡아야겠어.',
        '다음 발표가 정말 기대돼!'
      ],
      '中文': [
        '那个项目真的很有挑战性，但我们做到了！',
        '我为我们的研究找到了一些很好的资源。',
        '你读完我推荐的那本书了吗？',
        '我们应该很快安排我们的学习会议。',
        '我对我们下次的演讲很兴奋！'
      ]
    }
  },
  
  'Work Group 💼': {
    answerDelay: 4000,
    greeting: {
      'English': 'Hello! This is the work group. How can we assist you?',
      'Español': '¡Hola! Este es el grupo de trabajo. ¿Cómo podemos ayudarte?',
      'Français': 'Bonjour! C\'est le groupe de travail. Comment pouvons-nous vous aider?',
      'Deutsch': 'Hallo! Das ist die Arbeitsgruppe. Wie können wir helfen?',
      '日本語': 'こんにちは！こちら作業グループです。どのようなご用件でしょうか？',
      '한국어': '안녕하세요! 워크 그룹입니다. 어떻게 도와드릴까요?',
      '中文': '你好！这里是工作小组。我们能为您做些什么？'
    },
    responses: {
      'English': [
        'The quarterly reports are due next week.',
        'Don\'t forget about tomorrow\'s meeting at 10 AM.',
        'Please review the project timeline.',
        'The client feedback has been very positive.',
        'We need to finalize the budget proposal.'
      ],
      'Español': [
        'Los informes trimestrales vencen la próxima semana.',
        'No olvides la reunión de mañana a las 10 AM.',
        'Por favor revisa el cronograma del proyecto.',
        'Los comentarios del cliente han sido muy positivos.',
        'Necesitamos finalizar la propuesta de presupuesto.'
      ],
      'Français': [
        'Les rapports trimestriels sont dus la semaine prochaine.',
        'N\'oubliez pas la réunion de demain à 10h.',
        'Veuillez examiner le calendrier du projet.',
        'Les retours du client ont été très positifs.',
        'Nous devons finaliser la proposition de budget.'
      ],
      'Deutsch': [
        'Die Quartalsberichte sind nächste Woche fällig.',
        'Vergiss nicht das Meeting morgen um 10 Uhr.',
        'Bitte überprüfe den Projektzeitplan.',
        'Das Kundenfeedback war sehr positiv.',
        'Wir müssen den Budgetvorschlag finalisieren.'
      ],
      '日本語': [
        '四半期レポートは来週が締切です。',
        '明日の午前10時の会議を忘れないでください。',
        'プロジェクトのタイムラインを確認してください。',
        'クライアントのフィードバックはとても良好です。',
        '予算提案を最終確定する必要があります。'
      ],
      '한국어': [
        '분기 보고서가 다음 주까지입니다.',
        '내일 오전 10시 회의 잊지 마세요.',
        '프로젝트 일정을 검토해 주세요.',
        '고객 피드백이 매우 긍정적이었습니다.',
        '예산 제안서를 마무리해야 합니다.'
      ],
      '中文': [
        '季度报告下周到期。',
        '别忘了明天上午10点的会议。',
        '请审查项目时间表。',
        '客户反馈非常积极。',
        '我们需要最终确定预算提案。'
      ]
    }
  },
  
  'Emma 🎵': {
    answerDelay: 1800,
    greeting: {
      'English': 'Hey music lover! What\'s playing in your world?',
      'Español': '¡Oye amante de la música! ¿Qué está sonando en tu mundo?',
      'Français': 'Salut mélomane! Qu\'est-ce qui joue dans ton monde?',
      'Deutsch': 'Hey Musikliebhaber! Was läuft in deiner Welt?',
      '日本語': '音楽好きのあなた！今何聴いてる？',
      '한국어': '음악 애호가야! 요즘 뭐 듣고 있어?',
      '中文': '嘿音乐爱好者！你的世界在播放什么？'
    },
    responses: {
      'English': [
        'I just discovered this amazing new artist!',
        'That song has been stuck in my head all day!',
        'Want to go to the concert next month?',
        'I made you a new playlist, check it out!',
        'This beat is absolutely fire! 🔥'
      ],
      'Español': [
        '¡Acabo de descubrir este artista increíble!',
        '¡Esa canción ha estado en mi cabeza todo el día!',
        '¿Quieres ir al concierto el próximo mes?',
        '¡Te hice una nueva playlist, échale un vistazo!',
        '¡Este ritmo está increíble! 🔥'
      ],
      'Français': [
        'Je viens de découvrir cet artiste incroyable!',
        'Cette chanson me trotte dans la tête toute la journée!',
        'Tu veux aller au concert le mois prochain?',
        'Je t\'ai fait une nouvelle playlist, jette un œil!',
        'Ce rythme est absolument génial! 🔥'
      ],
      'Deutsch': [
        'Ich habe gerade diesen fantastischen neuen Künstler entdeckt!',
        'Dieser Song geht mir den ganzen Tag nicht aus dem Kopf!',
        'Willst du nächsten Monat zum Konzert?',
        'Ich hab dir eine neue Playlist gemacht, schau sie dir an!',
        'Dieser Beat ist absolut der Hammer! 🔥'
      ],
      '日本語': [
        'すごい新しいアーティストを見つけたの！',
        'あの曲が一日中頭から離れない！',
        '来月のコンサート行かない？',
        '新しいプレイリスト作ったから聴いてみて！',
        'このビート最高！🔥'
      ],
      '한국어': [
        '정말 멋진 새 아티스트를 발견했어!',
        '그 노래가 하루 종일 머릿속에 맴돌아!',
        '다음 달 콘서트 가고 싶어?',
        '새 플레이리스트 만들었어, 들어봐!',
        '이 비트 정말 불타! 🔥'
      ],
      '中文': [
        '我刚发现了一个很棒的新艺术家！',
        '那首歌整天都在我脑海里！',
        '下个月想去演唱会吗？',
        '我为你制作了一个新播放列表，看看吧！',
        '这个节拍绝对火！🔥'
      ]
    }
  },
  
  'Mike 🏃‍♂️': {
    answerDelay: 2200,
    greeting: {
      'English': 'Hey there! Just finished a run, what\'s up?',
      'Español': '¡Oye! Acabo de terminar de correr, ¿qué tal?',
      'Français': 'Salut! Je viens de finir mon footing, quoi de neuf?',
      'Deutsch': 'Hey da! Gerade mit dem Laufen fertig, was geht ab?',
      '日本語': 'やあ！ランニングから帰ったところ、どうしたの？',
      '한국어': '안녕! 방금 달리기 끝났어, 뭐해?',
      '中文': '嘿！刚跑完步，怎么了？'
    },
    responses: {
      'English': [
        'Want to join me for a morning jog tomorrow?',
        'I just beat my personal record! 🏃‍♂️',
        'This new running route is amazing!',
        'Training for the marathon is going great!',
        'You should really try this fitness app!'
      ],
      'Español': [
        '¿Quieres acompañarme a trotar mañana por la mañana?',
        '¡Acabo de superar mi récord personal! 🏃‍♂️',
        '¡Esta nueva ruta para correr es increíble!',
        '¡El entrenamiento para la maratón va genial!',
        '¡Realmente deberías probar esta app de fitness!'
      ],
      'Français': [
        'Tu veux te joindre à moi pour un jogging matinal demain?',
        'Je viens de battre mon record personnel! 🏃‍♂️',
        'Ce nouveau parcours de course est incroyable!',
        'L\'entraînement pour le marathon se passe super bien!',
        'Tu devrais vraiment essayer cette app fitness!'
      ],
      'Deutsch': [
        'Willst du morgen früh mit mir joggen?',
        'Ich habe gerade meinen persönlichen Rekord gebrochen! 🏃‍♂️',
        'Diese neue Laufstrecke ist unglaublich!',
        'Das Marathon-Training läuft super!',
        'Du solltest wirklich diese Fitness-App ausprobieren!'
      ],
      '日本語': [
        '明日の朝、一緒にジョギングしない？',
        '自己記録更新したよ！🏃‍♂️',
        'この新しいランニングコース最高！',
        'マラソンの練習、順調だよ！',
        'このフィットネスアプリ、本当に試してみて！'
      ],
      '한국어': [
        '내일 아침 조깅 같이할래?',
        '방금 개인 기록 경신했어! 🏃‍♂️',
        '이 새 러닝 코스 정말 좋아!',
        '마라톤 훈련이 잘 되고 있어!',
        '이 피트니스 앱 정말 써봐야 해!'
      ],
      '中文': [
        '明天早上想和我一起慢跑吗？',
        '我刚打破了个人记录！🏃‍♂️',
        '这条新的跑步路线太棒了！',
        '马拉松训练进展得很好！',
        '你真的应该试试这个健身应用！'
      ]
    }
  },
  
  'Police 🚨': {
    answerDelay: 800, // Emergency services answer quickly
    greeting: {
      'English': '911 What is your Emergency?',
      'Español': '911 ¿Cuál es su Emergencia?',
      'Français': '911 Quelle est votre Urgence?',
      'Deutsch': '911 Was ist Ihr Notfall?',
      '日本語': '911 緊急事態は何ですか？',
      '한국어': '911 응급상황이 무엇인가요?',
      '中文': '911 您的紧急情况是什么？'
    },
    responses: {
      'English': [
        'Please stay calm and describe your emergency.',
        'What is your current location?',
        'Are you in immediate danger?',
        'Emergency services are being dispatched.',
        'Please stay on the line for further instructions.'
      ],
      'Español': [
        'Por favor manténgase calmado y describa su emergencia.',
        '¿Cuál es su ubicación actual?',
        '¿Está en peligro inmediato?',
        'Los servicios de emergencia están siendo enviados.',
        'Por favor manténgase en línea para más instrucciones.'
      ],
      'Français': [
        'Veuillez rester calme et décrire votre urgence.',
        'Quelle est votre localisation actuelle?',
        'Êtes-vous en danger immédiat?',
        'Les services d\'urgence sont en cours d\'envoi.',
        'Veuillez rester en ligne pour d\'autres instructions.'
      ],
      'Deutsch': [
        'Bitte bleiben Sie ruhig und beschreiben Sie Ihren Notfall.',
        'Wo befinden Sie sich derzeit?',
        'Sind Sie in unmittelbarer Gefahr?',
        'Rettungsdienste werden geschickt.',
        'Bitte bleiben Sie am Telefon für weitere Anweisungen.'
      ],
      '日本語': [
        '落ち着いて緊急事態を説明してください。',
        '現在の場所はどちらですか？',
        '今すぐに危険な状況ですか？',
        '緊急サービスが派遣されています。',
        '更なる指示のため電話を切らないでください。'
      ],
      '한국어': [
        '침착하게 응급상황을 설명해주세요.',
        '현재 위치가 어디입니까?',
        '즉시 위험한 상황입니까?',
        '응급 서비스가 출동하고 있습니다.',
        '추가 지시를 위해 전화를 끊지 마세요.'
      ],
      '中文': [
        '请保持冷静并描述您的紧急情况。',
        '您目前的位置在哪里？',
        '您现在处于紧急危险中吗？',
        '紧急服务正在派遣。',
        '请保持通话以获得进一步指示。'
      ]
    }
  },
  
  'Lisa 🍕': {
    answerDelay: 1600,
    greeting: {
      'English': 'Pizza time! What\'s cooking? 🍕',
      'Español': '¡Hora de pizza! ¿Qué estás cocinando? 🍕',
      'Français': 'C\'est l\'heure de la pizza! Qu\'est-ce qui mijote? 🍕',
      'Deutsch': 'Pizza Zeit! Was kochst du? 🍕',
      '日本語': 'ピザタイム！何作ってる？🍕',
      '한국어': '피자 타임! 뭐 요리하고 있어? 🍕',
      '中文': '披萨时间！在做什么菜？🍕'
    },
    responses: {
      'English': [
        'I found this incredible new pizza place!',
        'Want to have a cooking session this weekend?',
        'I just tried this amazing recipe!',
        'Food brings people together, you know?',
        'Let\'s plan that pizza party! 🎉'
      ],
      'Español': [
        '¡Encontré esta increíble pizzería nueva!',
        '¿Quieres tener una sesión de cocina este fin de semana?',
        '¡Acabo de probar esta receta increíble!',
        'La comida une a las personas, ¿sabes?',
        '¡Planeemos esa fiesta de pizza! 🎉'
      ],
      'Français': [
        'J\'ai trouvé cette incroyable nouvelle pizzeria!',
        'Tu veux faire une session cuisine ce week-end?',
        'Je viens d\'essayer cette recette incroyable!',
        'La nourriture rassemble les gens, tu sais?',
        'Planifions cette fête pizza! 🎉'
      ],
      'Deutsch': [
        'Ich hab diese unglaublich neue Pizzeria gefunden!',
        'Willst du am Wochenende zusammen kochen?',
        'Ich hab gerade dieses fantastische Rezept ausprobiert!',
        'Essen bringt Menschen zusammen, weißt du?',
        'Lass uns diese Pizza-Party planen! 🎉'
      ],
      '日本語': [
        '素晴らしい新しいピザ屋を見つけたの！',
        '今度の週末、一緒に料理しない？',
        'すごいレシピを試してみたよ！',
        '食べ物って人を繋げるよね？',
        'ピザパーティー計画しよう！🎉'
      ],
      '한국어': [
        '정말 놀라운 새 피자집을 찾았어!',
        '이번 주말에 요리 시간 가질래?',
        '방금 이 놀라운 레시피를 시도해봤어!',
        '음식이 사람들을 하나로 만들어주지, 알지?',
        '피자 파티 계획하자! 🎉'
      ],
      '中文': [
        '我发现了一家令人难以置信的新披萨店！',
        '这周末想一起做饭吗？',
        '我刚试了这个很棒的食谱！',
        '你知道吗，食物把人们聚在一起？',
        '让我们计划那个披萨聚会！🎉'
      ]
    }
  }
}

export default function CallInterface({ language, contactName, contactAvatar, onEnd, onHaptic, onBatteryKill }: CallInterfaceProps): JSX.Element {
  const [callState, setCallState] = useState<CallState>('connecting')
  const [callDuration, setCallDuration] = useState<number>(0)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [callMessages, setCallMessages] = useState<CallMessage[]>([])
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(true)
  
  const t = getTranslation(language)
  const contactData = CONTACT_RESPONSES[contactName] || CONTACT_RESPONSES['Mom 👩‍💼']
  const isEmergencyCall = contactName === 'Police 🚨' || contactName.includes('911')

  useEffect(() => {
    setIsVisible(true)
    animate('.call-interface', 'zoomIn')
    
    // Initial connecting haptic
    onHaptic(500)
    
    // Simulate call progression
    const progressionTimer = setTimeout(() => {
      setCallState('ringing')
      onHaptic(200)
      
      // Contact answers after their specific delay
      const answerTimer = setTimeout(() => {
        setCallState('answered')
        onHaptic(100)
        
        // Contact greeting
        setTimeout(() => {
          setCallState('talking')
          const greeting = contactData.greeting[language] || contactData.greeting['English']
          addMessage(greeting, true)
          onHaptic(150)
        }, 1000)
      }, contactData.answerDelay)
      
      return () => clearTimeout(answerTimer)
    }, 1500)

    // Update call duration every second when connected
    const durationInterval = setInterval(() => {
      if (callState === 'answered' || callState === 'talking') {
        setCallDuration(prev => prev + 1)
      }
    }, 1000)

    // Auto-generate contact responses during call
    const responseInterval = setInterval(() => {
      if (callState === 'talking' && Math.random() > 0.7) {
        const responses = contactData.responses[language] || contactData.responses['English']
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        addMessage(randomResponse, true)
        onHaptic(80)
      }
    }, 8000 + Math.random() * 12000) // Random interval between 8-20 seconds

    return () => {
      clearTimeout(progressionTimer)
      clearInterval(durationInterval)
      clearInterval(responseInterval)
    }
  }, [callState, contactName, language, onHaptic])

  // Text-to-Speech functionality
  const speakMessage = (text: string, isFromContact: boolean): void => {
    if (!isSpeechEnabled || !('speechSynthesis' in window)) return

    try {
      // Stop any current speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Configure voice for contact vs user
      if (isFromContact) {
        utterance.rate = 0.9
        utterance.pitch = 1.1
        utterance.volume = 0.8
      } else {
        utterance.rate = 1.0
        utterance.pitch = 0.9
        utterance.volume = 0.7
      }

      // Try to set a more natural voice
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(language === '日本語' ? 'ja' : 
                              language === '한국어' ? 'ko' : 
                              language === '中文' ? 'zh' : 
                              language === 'Français' ? 'fr' : 
                              language === 'Deutsch' ? 'de' : 
                              language === 'Español' ? 'es' : 'en')
      )
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.warn('Text-to-Speech error:', error)
    }
  }

  const addMessage = (text: string, isFromContact: boolean): void => {
    const newMessage: CallMessage = {
      id: Date.now().toString(),
      text,
      isContact: isFromContact,
      timestamp: new Date()
    }
    setCallMessages(prev => [...prev, newMessage])
    animate('.call-message', 'fadeInUp')
    
    // Speak the message
    if (isFromContact && isSpeechEnabled) {
      setTimeout(() => {
        speakMessage(text, isFromContact)
      }, 500) // Small delay for better experience
    }
  }

  const formatCallDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = (): void => {
    onHaptic(200)
    setCallState('ended')
    animate('.call-interface', 'zoomOut')
    setTimeout(() => {
      onEnd()
    }, 600)
  }

  const handleMute = (): void => {
    setIsMuted(!isMuted)
    onHaptic(50)
    animate('.mute-button', isMuted ? 'bounceIn' : 'pulse')
  }

  const toggleSpeech = (): void => {
    setIsSpeechEnabled(!isSpeechEnabled)
    onHaptic(50)
    
    // Stop current speech if disabling
    if (isSpeechEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    
    animate('.speech-button', 'bounceIn')
  }

  const getCallStateText = (): string => {
    switch (callState) {
      case 'connecting': return t.calling
      case 'ringing': return t.calling
      case 'answered': return t.calling
      case 'talking': return `${t.calling} - ${formatCallDuration(callDuration)}`
      case 'ended': return 'Call ended'
      default: return t.calling
    }
  }

  return (
    <div className={`call-interface h-full w-full bg-gradient-to-b from-green-900 via-green-800 to-green-900 relative overflow-hidden ${isVisible ? 'animate__animated' : ''}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 animate-ping"
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s'
            }}
          ></div>
        ))}
      </div>

      {/* Call Status */}
      <div className="absolute top-16 left-0 right-0 text-center z-10">
        <div className="text-white/90 text-base font-medium mb-1">
          {getCallStateText()}
        </div>
        {(callState === 'connecting' || callState === 'ringing') && (
          <div className="text-white/70 text-sm">
            {callState === 'connecting' ? 'Connecting...' : 'Ringing...'}
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="flex flex-col items-center justify-center h-full relative z-10 -mt-8">
        <div className="relative mb-8">
          <Avatar className={`w-36 h-36 bg-white/20 border-4 border-white/40 ${callState === 'ringing' ? 'animate-bounce' : 'animate-pulse'}`}>
            <AvatarFallback className="text-5xl">{contactAvatar}</AvatarFallback>
          </Avatar>
          
          {/* Dynamic Call Animation Ring */}
          {callState !== 'ended' && (
            <div className={`absolute inset-0 rounded-full border-4 border-white/50 animate-ping`}></div>
          )}
          {(callState === 'talking' || callState === 'answered') && (
            <div className="absolute inset-2 rounded-full border-2 border-green-400/60 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          )}
        </div>

        <h1 className="text-4xl font-bold text-white mb-3 text-center">
          {contactName}
        </h1>
        
        {/* Call State Indicator */}
        <div className="flex items-center space-x-2 mb-6">
          {callState === 'talking' && (
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          )}
          <div className={`text-lg ${callState === 'talking' ? 'text-green-200' : 'text-white/70'}`}>
            {callState === 'connecting' && 'Connecting...'}
            {callState === 'ringing' && 'Ringing...'}
            {callState === 'answered' && 'Answered'}
            {callState === 'talking' && 'In conversation'}
          </div>
        </div>

        {/* Live Call Messages */}
        {callMessages.length > 0 && callState === 'talking' && (
          <div className="bg-black/40 rounded-2xl p-4 mx-6 mb-6 max-w-sm max-h-32 overflow-y-auto backdrop-blur-sm">
            <div className="space-y-2">
              {callMessages.slice(-2).map((message) => (
                <div key={message.id} className="call-message animate__animated">
                  <div className={`text-sm ${message.isContact ? 'text-green-200' : 'text-white'} leading-relaxed`}>
                    <span className="text-white/50 text-xs">
                      {message.isContact ? contactName.split(' ')[0] : 'You'}: 
                    </span>
                    <br />
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          {/* Mute Button */}
          <Button
            onClick={handleMute}
            className={`mute-button w-16 h-16 rounded-full ${
              isMuted ? 'bg-red-500/80 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
            } backdrop-blur-sm border border-white/30 text-white text-2xl animate__animated`}
            size="sm"
          >
            {isMuted ? '🔇' : '🔊'}
          </Button>
          
          {/* End Call Button */}
          <Button
            onClick={handleEndCall}
            className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white text-3xl animate-pulse shadow-2xl"
            size="sm"
          >
            📞
          </Button>
          
          {/* Speech Toggle Button */}
          <Button
            onClick={toggleSpeech}
            className={`speech-button w-16 h-16 rounded-full ${
              isSpeechEnabled ? 'bg-green-500/80 hover:bg-green-600' : 'bg-white/20 hover:bg-white/30'
            } backdrop-blur-sm border border-white/30 text-white text-2xl animate__animated`}
            size="sm"
          >
            {isSpeechEnabled ? '🗣️' : '🔇'}
          </Button>
        </div>

        {/* Additional Controls - Only show during active call */}
        {(callState === 'talking' || callState === 'answered') && (
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={() => {
                onHaptic(50)
                addMessage("Thanks for the call!", false)
              }}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl backdrop-blur-sm border border-white/20 text-white text-sm"
              size="sm"
            >
              💬 Quick Reply
            </Button>
            <Button
              onClick={toggleSpeech}
              className={`px-4 py-2 ${
                isSpeechEnabled ? 'bg-green-500/80 hover:bg-green-600' : 'bg-white/15 hover:bg-white/25'
              } rounded-xl backdrop-blur-sm border border-white/20 text-white text-sm`}
              size="sm"
            >
              {isSpeechEnabled ? '🗣️ Speech ON' : '🔇 Speech OFF'}
            </Button>
            <Button
              onClick={() => onHaptic(50)}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl backdrop-blur-sm border border-white/20 text-white text-sm"
              size="sm"
            >
              ⏸️ Hold
            </Button>
          </div>
        )}
      </div>

      {/* Floating Call Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['📞', '💚', '📱', '🔊', '💬'].map((icon, i) => (
          <div
            key={i}
            className="absolute text-2xl text-white/30 animate-bounce"
            style={{
              left: `${15 + i * 20}%`,
              top: `${75 + Math.sin(Date.now() / 1000 + i) * 15}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${4 + i * 0.5}s`
            }}
          >
            {icon}
          </div>
        ))}
      </div>
    </div>
  )
}