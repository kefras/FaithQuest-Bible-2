import { Question } from '../types';

export const QUESTIONS: Question[] = [
  // BEGINNER - OLD TESTAMENT
  {
    id: 'b-ot-1',
    testament: 'Old',
    level: 'Beginner',
    text: 'Who was the first man created by God?',
    options: ['Noah', 'Adam', 'Abraham', 'Moses'],
    correctAnswer: 'Adam',
    hint: 'He lived in the Garden of Eden.',
    category: 'Genesis'
  },
  {
    id: 'b-ot-2',
    testament: 'Old',
    level: 'Beginner',
    text: 'What did Noah build to survive the great flood?',
    options: ['A tower', 'A temple', 'An ark', 'A palace'],
    correctAnswer: 'An ark',
    hint: 'It was a massive wooden vessel.',
    category: 'Genesis'
  },
  {
    id: 'b-ot-3',
    testament: 'Old',
    level: 'Beginner',
    text: 'Who was swallowed by a great fish?',
    options: ['Jonah', 'Peter', 'David', 'Joseph'],
    correctAnswer: 'Jonah',
    hint: 'He was trying to run away from God\'s mission to Nineveh.',
    category: 'Jonah'
  },
  {
    id: 'b-ot-4',
    testament: 'Old',
    level: 'Beginner',
    text: 'Who led the Israelites out of Egypt?',
    options: ['Joshua', 'Moses', 'Isaac', 'Joseph'],
    correctAnswer: 'Moses',
    hint: 'He saw a burning bush.',
    category: 'Exodus'
  },
  {
    id: 'b-ot-5',
    testament: 'Old',
    level: 'Beginner',
    text: 'What is the first book of the Bible?',
    options: ['Exodus', 'Psalms', 'Genesis', 'Matthew'],
    correctAnswer: 'Genesis',
    hint: 'It means "beginning".',
    category: 'Genesis'
  },
  {
    id: 'b-ot-6',
    testament: 'Old',
    level: 'Beginner',
    text: 'How many days did it take God to create the world (before resting)?',
    options: ['3', '7', '6', '12'],
    correctAnswer: '6',
    hint: 'He rested on the 7th day.',
    category: 'Genesis'
  },
  // BEGINNER - NEW TESTAMENT
  {
    id: 'b-nt-1',
    testament: 'New',
    level: 'Beginner',
    text: 'Where was Jesus born?',
    options: ['Nazareth', 'Jerusalem', 'Bethlehem', 'Rome'],
    correctAnswer: 'Bethlehem',
    hint: 'A star led the wise men to this town.',
    category: 'Matthew'
  },
  {
    id: 'b-nt-2',
    testament: 'New',
    level: 'Beginner',
    text: 'What was Jesus\' mother\'s name?',
    options: ['Elizabeth', 'Martha', 'Mary', 'Sarah'],
    correctAnswer: 'Mary',
    hint: 'She was chosen by God while she was a virgin.',
    category: 'Luke'
  },
  {
    id: 'b-nt-3',
    testament: 'New',
    level: 'Beginner',
    text: 'How many disciples did Jesus choose initially?',
    options: ['7', '10', '12', '40'],
    correctAnswer: '12',
    hint: 'It\'s the same number as the tribes of Israel.',
    category: 'Gospels'
  },
  {
    id: 'b-nt-4',
    testament: 'New',
    level: 'Beginner',
    text: 'Who betrayed Jesus for 30 pieces of silver?',
    options: ['Peter', 'Paul', 'Judas Iscariot', 'Thomas'],
    correctAnswer: 'Judas Iscariot',
    hint: 'He was one of the 12 disciples.',
    category: 'Gospels'
  },
  {
    id: 'b-nt-5',
    testament: 'New',
    level: 'Beginner',
    text: 'What was Jesus\' first miracle?',
    options: ['Walking on water', 'Turning water into wine', 'Healing a blind man', 'Raising Lazarus'],
    correctAnswer: 'Turning water into wine',
    hint: 'It happened at a wedding in Cana.',
    category: 'John'
  },
  // MEDIUM - OLD TESTAMENT
  {
    id: 'm-ot-1',
    testament: 'Old',
    level: 'Medium',
    text: 'How many plagues did God send upon Egypt?',
    options: ['7', '10', '12', '3'],
    correctAnswer: '10',
    hint: 'The final one involved the firstborn sons.',
    category: 'Exodus'
  },
  {
    id: 'm-ot-2',
    testament: 'Old',
    level: 'Medium',
    text: 'Who defeated Goliath with a sling and a stone?',
    options: ['Saul', 'Solomon', 'David', 'Samson'],
    correctAnswer: 'David',
    hint: 'He was a shepherd boy who became king.',
    category: '1 Samuel'
  },
  {
    id: 'm-ot-3',
    testament: 'Old',
    level: 'Medium',
    text: 'Who was the son of Abraham and Sarah?',
    options: ['Ishmael', 'Isaac', 'Jacob', 'Esau'],
    correctAnswer: 'Isaac',
    hint: 'His name means "laughter".',
    category: 'Genesis'
  },
  {
    id: 'm-ot-4',
    testament: 'Old',
    level: 'Medium',
    text: 'Who were the first two kings of Israel?',
    options: ['David and Solomon', 'Saul and David', 'Moses and Joshua', 'Abraham and Isaac'],
    correctAnswer: 'Saul and David',
    hint: 'The first was tall, the second was a man after God\'s own heart.',
    category: '1 Samuel'
  },
  {
    id: 'm-ot-5',
    testament: 'Old',
    level: 'Medium',
    text: 'Which prophet was thrown into a den of lions?',
    options: ['Daniel', 'Jeremiah', 'Ezekiel', 'Isaiah'],
    correctAnswer: 'Daniel',
    hint: 'He prayed faithfully despite the king\'s decree.',
    category: 'Daniel'
  },
  // MEDIUM - NEW TESTAMENT
  {
    id: 'm-nt-1',
    testament: 'New',
    level: 'Medium',
    text: 'In which city were the followers of Jesus first called Christians?',
    options: ['Jerusalem', 'Rome', 'Antioch', 'Damascus'],
    correctAnswer: 'Antioch',
    hint: 'It was a major city in the Roman province of Syria.',
    category: 'Acts'
  },
  {
    id: 'm-nt-2',
    testament: 'New',
    level: 'Medium',
    text: 'Who recognized Jesus as the Messiah when he was presented at the Temple as a baby?',
    options: ['Simeon', 'Herod', 'Nicodemus', 'Zacchaeus'],
    correctAnswer: 'Simeon',
    hint: 'He had been promised he wouldn\'t die until he saw the Lord\'s Christ.',
    category: 'Luke'
  },
  {
    id: 'm-nt-3',
    testament: 'New',
    level: 'Medium',
    text: 'Who was the first martyr of the Christian church?',
    options: ['Peter', 'Stephen', 'James', 'Paul'],
    correctAnswer: 'Stephen',
    hint: 'He was stoned while praying for his executioners.',
    category: 'Acts'
  },
  {
    id: 'm-nt-4',
    testament: 'New',
    level: 'Medium',
    text: 'What was the original name of the Apostle Paul?',
    options: ['Silas', 'Barnabas', 'Saul of Tarsus', 'Simon'],
    correctAnswer: 'Saul of Tarsus',
    hint: 'He was a Pharisee before his conversion on the road to Damascus.',
    category: 'Acts'
  },
  {
    id: 'm-nt-5',
    testament: 'New',
    level: 'Medium',
    text: 'How many books are in the New Testament?',
    options: ['39', '27', '66', '40'],
    correctAnswer: '27',
    hint: 'It starts with Matthew and ends with Revelation.',
    category: 'General'
  },
  // ADVANCE - OLD TESTAMENT
  {
    id: 'a-ot-1',
    testament: 'Old',
    level: 'Advance',
    text: 'What was the name of the mountain where Moses received the Ten Commandments?',
    options: ['Mount Nebo', 'Mount Sinai', 'Mount Carmel', 'Mount Ararat'],
    correctAnswer: 'Mount Sinai',
    hint: 'Also known as Mount Horeb.',
    category: 'Exodus'
  },
  {
    id: 'a-ot-2',
    testament: 'Old',
    level: 'Advance',
    text: 'Who was the oldest man mentioned in the Bible?',
    options: ['Adam', 'Noah', 'Methuselah', 'Enoch'],
    correctAnswer: 'Methuselah',
    hint: 'He lived to be 969 years old.',
    category: 'Genesis'
  },
  {
    id: 'a-ot-3',
    testament: 'Old',
    level: 'Advance',
    text: 'Who was the left-handed judge who killed King Eglon?',
    options: ['Gideon', 'Samson', 'Ehud', 'Deborah'],
    correctAnswer: 'Ehud',
    hint: 'His story is found in Judges 3.',
    category: 'Judges'
  },
  {
    id: 'a-ot-4',
    testament: 'Old',
    level: 'Advance',
    text: 'On which mountain did Elijah challenge the prophets of Baal?',
    options: ['Mount Sinai', 'Mount Carmel', 'Mount Hermon', 'Mount Tabor'],
    correctAnswer: 'Mount Carmel',
    hint: 'A great fire came down from heaven there.',
    category: '1 Kings'
  },
  {
    id: 'a-ot-5',
    testament: 'Old',
    level: 'Advance',
    text: 'Who was the father of King David?',
    options: ['Saul', 'Jesse', 'Samuel', 'Jonathan'],
    correctAnswer: 'Jesse',
    hint: 'He lived in Bethlehem.',
    category: '1 Samuel'
  },
  // ADVANCE - NEW TESTAMENT
  {
    id: 'a-nt-1',
    testament: 'New',
    level: 'Advance',
    text: 'On what island was John when he wrote the Book of Revelation?',
    options: ['Cyprus', 'Crete', 'Patmos', 'Malta'],
    correctAnswer: 'Patmos',
    hint: 'He was in exile for the word of God.',
    category: 'Revelation'
  },
  {
    id: 'a-nt-2',
    testament: 'New',
    level: 'Advance',
    text: 'Which New Testament book is primarily about a slave named Onesimus?',
    options: ['Titus', 'Philemon', 'Colossians', 'Galatians'],
    correctAnswer: 'Philemon',
    hint: 'It is a short personal letter from Paul.',
    category: 'Philemon'
  },
  {
    id: 'a-nt-3',
    testament: 'New',
    level: 'Advance',
    text: 'Who was the companion of Paul on his first missionary journey?',
    options: ['Silas', 'Barnabas', 'Timothy', 'Luke'],
    correctAnswer: 'Barnabas',
    hint: 'His name means "Son of Encouragement".',
    category: 'Acts'
  },
  {
    id: 'a-nt-4',
    testament: 'New',
    level: 'Advance',
    text: 'Who was the sorcerer who tried to buy the power of the Holy Spirit?',
    options: ['Elymas', 'Simon Magus', 'Ananias', 'Agabus'],
    correctAnswer: 'Simon Magus',
    hint: 'Acts 8 tells his story in Samaria.',
    category: 'Acts'
  },
  {
    id: 'a-nt-5',
    testament: 'New',
    level: 'Advance',
    text: 'In the Parable of the Sower, what does the seed represent?',
    options: ['The Holy Spirit', 'Faith', 'The Word of God', 'Good Deeds'],
    correctAnswer: 'The Word of God',
    hint: 'Luke 8:11 explains this directly.',
    category: 'Parables'
  },
  // NEW QUESTIONS - BEGINNER - OLD TESTAMENT
  {
    id: 'b-ot-7',
    testament: 'Old',
    level: 'Beginner',
    text: 'What was the source of Samson\'s great strength?',
    options: ['His eyes', 'His hair', 'His shoes', 'His belt'],
    correctAnswer: 'His hair',
    hint: 'It was never supposed to be cut.',
    category: 'Judges'
  },
  {
    id: 'b-ot-8',
    testament: 'Old',
    level: 'Beginner',
    text: 'Out of what did God create Eve?',
    options: ['Dust', 'A flower', 'Adam\'s rib', 'A cloud'],
    correctAnswer: 'Adam\'s rib',
    hint: 'She was created from the first man.',
    category: 'Genesis'
  },
  {
    id: 'b-ot-9',
    testament: 'Old',
    level: 'Beginner',
    text: 'What did Joseph\'s father give him that made his brothers jealous?',
    options: ['A gold ring', 'A robe of many colors', 'A fast horse', 'A silver sword'],
    correctAnswer: 'A robe of many colors',
    hint: 'It was a special, beautiful garment.',
    category: 'Genesis'
  },
  {
    id: 'b-ot-10',
    testament: 'Old',
    level: 'Beginner',
    text: 'On what were the Ten Commandments written?',
    options: ['Papyrus', 'Leather', 'Stone tablets', 'Gold plates'],
    correctAnswer: 'Stone tablets',
    hint: 'Moses brought them down from Mount Sinai.',
    category: 'Exodus'
  },
  // NEW QUESTIONS - BEGINNER - NEW TESTAMENT
  {
    id: 'b-nt-6',
    testament: 'New',
    level: 'Beginner',
    text: 'Who was the cousin of Jesus who baptized him?',
    options: ['Peter', 'James', 'John the Baptist', 'Matthew'],
    correctAnswer: 'John the Baptist',
    hint: 'He preached in the wilderness wearing camel\'s hair.',
    category: 'Matthew'
  },
  {
    id: 'b-nt-7',
    testament: 'New',
    level: 'Beginner',
    text: 'What was the short man\'s name who climbed a sycamore tree to see Jesus?',
    options: ['Zacchaeus', 'Lazarus', 'Bartimaeus', 'Cornelius'],
    correctAnswer: 'Zacchaeus',
    hint: 'He was a wealthy tax collector in Jericho.',
    category: 'Luke'
  },
  {
    id: 'b-nt-8',
    testament: 'New',
    level: 'Beginner',
    text: 'Which disciple walked on water toward Jesus but then began to sink?',
    options: ['John', 'Peter', 'Andrew', 'Thomas'],
    correctAnswer: 'Peter',
    hint: 'He was often the most outspoken of the twelve.',
    category: 'Matthew'
  },
  {
    id: 'b-nt-9',
    testament: 'New',
    level: 'Beginner',
    text: 'In which town was Jesus raised?',
    options: ['Bethlehem', 'Nazareth', 'Jericho', 'Capernaum'],
    correctAnswer: 'Nazareth',
    hint: 'People asked, "Can anything good come from...?"',
    category: 'Matthew'
  },
  // NEW QUESTIONS - MEDIUM - OLD TESTAMENT
  {
    id: 'm-ot-6',
    testament: 'Old',
    level: 'Medium',
    text: 'Which woman became Queen of Persia and saved her people from destruction?',
    options: ['Ruth', 'Esther', 'Rahab', 'Hagar'],
    correctAnswer: 'Esther',
    hint: 'She was coached by her cousin Mordecai.',
    category: 'Esther'
  },
  {
    id: 'm-ot-7',
    testament: 'Old',
    level: 'Medium',
    text: 'How many people were on Noah\'s Ark?',
    options: ['2', '4', '8', '12'],
    correctAnswer: '8',
    hint: 'Noah and his wife, plus their three sons and their wives.',
    category: 'Genesis'
  },
  {
    id: 'm-ot-8',
    testament: 'Old',
    level: 'Medium',
    text: 'Who was the prophet that succeeded Elijah after he was taken to heaven?',
    options: ['Elisha', 'Isaiah', 'Samuel', 'Malachi'],
    correctAnswer: 'Elisha',
    hint: 'He asked for a double portion of his predecessor\'s spirit.',
    category: '2 Kings'
  },
  {
    id: 'm-ot-9',
    testament: 'Old',
    level: 'Medium',
    text: 'What was the name of the prostitute who hid the Israelite spies in Jericho?',
    options: ['Delilah', 'Rahab', 'Jezebel', 'Leah'],
    correctAnswer: 'Rahab',
    hint: 'She lowered them out of her window with a scarlet cord.',
    category: 'Joshua'
  },
  // NEW QUESTIONS - MEDIUM - NEW TESTAMENT
  {
    id: 'm-nt-6',
    testament: 'New',
    level: 'Medium',
    text: 'Who wrote the book of Acts?',
    options: ['Paul', 'Peter', 'Luke', 'John'],
    correctAnswer: 'Luke',
    hint: 'He was a physician and also wrote a Gospel.',
    category: 'Acts'
  },
  {
    id: 'm-nt-7',
    testament: 'New',
    level: 'Medium',
    text: 'What did the Prodigal Son do for work when he ran out of money?',
    options: ['Cook', 'Pig feeder', 'Carpenter', 'Shepherd'],
    correctAnswer: 'Pig feeder',
    hint: 'He longed to eat what the animals were eating.',
    category: 'Luke'
  },
  {
    id: 'm-nt-8',
    testament: 'New',
    level: 'Medium',
    text: 'How many Fruit of the Spirit are listed in Galatians 5?',
    options: ['7', '12', '9', '3'],
    correctAnswer: '9',
    hint: 'They include love, joy, peace, and patience.',
    category: 'Galatians'
  },
  {
    id: 'm-nt-9',
    testament: 'New',
    level: 'Medium',
    text: 'Which island was Paul shipwrecked on while traveling to Rome?',
    options: ['Crete', 'Malta', 'Cyprus', 'Sicily'],
    correctAnswer: 'Malta',
    hint: 'The inhabitants showed unusual kindness to them.',
    category: 'Acts'
  },
  // NEW QUESTIONS - ADVANCE - OLD TESTAMENT
  {
    id: 'a-ot-6',
    testament: 'Old',
    level: 'Advance',
    text: 'Who was the king of Babylon when Daniel interpreted the dream of the huge statue?',
    options: ['Darius', 'Cyrus', 'Nebuchadnezzar', 'Belshazzar'],
    correctAnswer: 'Nebuchadnezzar',
    hint: 'He also built the Hanging Gardens.',
    category: 'Daniel'
  },
  {
    id: 'a-ot-7',
    testament: 'Old',
    level: 'Advance',
    text: 'Who was the mother of Ishmael?',
    options: ['Sarah', 'Hagar', 'Rebekah', 'Rachel'],
    correctAnswer: 'Hagar',
    hint: 'She was Sarah\'s Egyptian handmaid.',
    category: 'Genesis'
  },
  {
    id: 'a-ot-8',
    testament: 'Old',
    level: 'Advance',
    text: 'Which prophet saw a valley full of dry bones that came to life?',
    options: ['Isaiah', 'Jeremiah', 'Ezekiel', 'Joel'],
    correctAnswer: 'Ezekiel',
    hint: 'He was a priest who prophesied during the Babylonian exile.',
    category: 'Ezekiel'
  },
  {
    id: 'a-ot-9',
    testament: 'Old',
    level: 'Advance',
    text: 'Who was the King of Salem and Priest of God Most High who blessed Abraham?',
    options: ['Abimelech', 'Melchizedek', 'Lot', 'Enoch'],
    correctAnswer: 'Melchizedek',
    hint: 'His name means "King of Righteousness".',
    category: 'Genesis'
  },
  // NEW QUESTIONS - ADVANCE - NEW TESTAMENT
  {
    id: 'a-nt-6',
    testament: 'New',
    level: 'Advance',
    text: 'To which church did Paul write about the "Armor of God"?',
    options: ['Rome', 'Corinth', 'Ephesus', 'Philippi'],
    correctAnswer: 'Ephesus',
    hint: 'Look in the 6th chapter of this epistle.',
    category: 'Ephesians'
  },
  {
    id: 'a-nt-7',
    testament: 'New',
    level: 'Advance',
    text: 'Who was the high priest who presided over the trial of Jesus before the Sanhedrin?',
    options: ['Annas', 'Caiaphas', 'Gamaliel', 'Nicodemus'],
    correctAnswer: 'Caiaphas',
    hint: 'He said it was better for one man to die for the people.',
    category: 'Gospels'
  },
  {
    id: 'a-nt-8',
    testament: 'New',
    level: 'Advance',
    text: 'How many churches are specifically addressed in the beginning of Revelation?',
    options: ['3', '12', '7', '1'],
    correctAnswer: '7',
    hint: 'They were all located in the province of Asia.',
    category: 'Revelation'
  },
  {
    id: 'a-nt-9',
    testament: 'New',
    level: 'Advance',
    text: 'Which New Testament book focuses heavily on the contrast between faith and works?',
    options: ['Galatians', 'James', 'Romans', 'Hebrews'],
    correctAnswer: 'James',
    hint: 'It famously says, "Faith without works is dead."',
    category: 'James'
  }
];
