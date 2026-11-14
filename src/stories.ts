type Version = {
  /** Chinese, English and, in a dialogue, who is speaking. */
  lines: ([string, string] | [string, string, string])[];
  grammar: string;
  check: [string, string, string[], string];
  reply: [string, string, string];
};
type Seed = {
  id: string;
  title: string;
  subtitle: string;
  topic: string;
  emoji: string;
  color: string;
  format: "Story" | "News-style";
  versions: Version[];
};
export const storySeeds: Seed[] = [
  {
    id: "breakfast",
    title: "A slower morning",
    subtitle: "Something warm to start the day",
    topic: "Food",
    emoji: "🥣",
    color: "#F7E4BC",
    format: "Story",
    versions: [
      {
        lines: [
          ["今天我在家。", "Today I am at home."],
          ["妈妈喝茶，我喝水。", "Mom drinks tea, and I drink water."],
          ["桌子上有三个苹果。", "There are three apples on the table."],
          ["我吃一个苹果。", "I eat an apple."],
          ["这个苹果很好吃。", "This apple is delicious."],
        ],
        grammar:
          "Location + 有 + thing: 桌子上有三个苹果。The location comes first when saying what is there.",
        check: [
          "What is on the table?",
          "Three apples",
          ["Three apples", "Two books", "A cup of coffee"],
          "桌子上有三个苹果。There are three apples on the table.",
        ],
        reply: [
          "Type the Chinese word for apple.",
          "苹果",
          "苹果 · píng guǒ · apple",
        ],
      },
      {
        lines: [
          ["早上七点，我起床了。", "At seven in the morning, I got up."],
          ["妈妈正在做饭。", "Mom is cooking."],
          ["我想喝牛奶，还想吃鸡蛋。", "I want some milk and also an egg."],
          ["我们一起吃饭。", "We eat together."],
          [
            "今天不忙，可以慢慢吃。",
            "We are not busy today, so we can eat slowly.",
          ],
        ],
        grammar:
          "正在 + verb highlights an action in progress: 妈妈正在做饭。还 adds another item or idea.",
        check: [
          "Why can they eat slowly?",
          "They are not busy",
          ["They are not busy", "The food is cold", "They are at school"],
          "今天不忙。They are not busy today.",
        ],
        reply: [
          "Type the Chinese word for milk.",
          "牛奶",
          "牛奶 · niú nǎi · milk",
        ],
      },
      {
        lines: [
          ["最近我总是很忙。", "Recently I have always been busy."],
          [
            "为了早点起床，我决定晚上不看手机。",
            "To get up earlier, I decided not to look at my phone at night.",
          ],
          [
            "今天我先做饭，然后和妈妈一起吃。",
            "Today I cook first and then eat with Mom.",
          ],
          [
            "虽然饭很简单，但是我们很满意。",
            "Although the meal is simple, we are very satisfied.",
          ],
          [
            "我发现，慢慢吃饭也是一种休息。",
            "I discovered that eating slowly is also a kind of rest.",
          ],
        ],
        grammar:
          "先…然后… orders actions. 虽然…但是… connects a concession with its main point: although… but….",
        check: [
          "What change does the speaker decide to make?",
          "No phone at night",
          ["No phone at night", "Skip breakfast", "Buy a new phone"],
          "晚上不看手机。The speaker avoids the phone at night to get up earlier.",
        ],
        reply: [
          "Type the Chinese word for satisfied.",
          "满意",
          "满意 · mǎn yì · satisfied",
        ],
      },
    ],
  },
  {
    id: "cat",
    title: "The little visitor",
    subtitle: "A cat finds its favorite spot",
    topic: "Nature",
    emoji: "🐈",
    color: "#E8DFCA",
    format: "Story",
    versions: [
      {
        lines: [
          ["我家有一只猫。", "There is a cat in my home."],
          ["它很小，很漂亮。", "It is small and beautiful."],
          ["今天它在椅子上。", "Today it is on the chair."],
          ["我看书，它睡觉。", "I read a book, and it sleeps."],
          ["我很喜欢它。", "I like it very much."],
        ],
        grammar:
          "只 (zhī) counts many animals: 一只猫。The same character is zhǐ when it means “only”.",
        check: [
          "Where is the cat?",
          "On the chair",
          ["On the chair", "At school", "In the shop"],
          "它在椅子上。It is on the chair.",
        ],
        reply: ["Type the Chinese word for cat.", "猫", "猫 · māo · cat"],
      },
      {
        lines: [
          ["我家有一只小猫。", "There is a little cat in my home."],
          ["它每天都在我的房间里睡觉。", "It sleeps in my room every day."],
          ["今天我找不到它。", "Today I cannot find it."],
          [
            "我打开门，看见它在爸爸旁边。",
            "I open the door and see it next to Dad.",
          ],
          ["爸爸笑了，我也笑了。", "Dad smiles, and I smile too."],
        ],
        grammar:
          "Verb + 不到 expresses inability to achieve a result: 找不到 means cannot find. 看见 means to see successfully.",
        check: [
          "Who is the cat next to?",
          "Dad",
          ["Dad", "A doctor", "A teacher"],
          "它在爸爸旁边。It is next to Dad.",
        ],
        reply: [
          "Type the Chinese word for room.",
          "房间",
          "房间 · fáng jiān · room",
        ],
      },
      {
        lines: [
          [
            "我们搬家以后，小猫有点害怕。",
            "After we moved, the little cat was a bit scared.",
          ],
          [
            "它一直在床下面，不愿意出来。",
            "It stayed under the bed and did not want to come out.",
          ],
          [
            "我拿了一点鱼，放在它旁边。",
            "I took a little fish and put it next to the cat.",
          ],
          [
            "过了一会儿，它终于出来了。",
            "After a little while, it finally came out.",
          ],
          [
            "现在它已经习惯了新的家。",
            "Now it is already used to the new home.",
          ],
        ],
        grammar:
          "以后 means after. 已经…了 marks a state that has now been reached: 已经习惯了。",
        check: [
          "Why was the cat afraid?",
          "The family moved",
          ["The family moved", "It was raining", "It lost a toy"],
          "我们搬家以后，小猫有点害怕。The move made the cat uneasy.",
        ],
        reply: [
          "Type the Chinese word for finally.",
          "终于",
          "终于 · zhōng yú · finally",
        ],
      },
    ],
  },
  {
    id: "rain",
    title: "A change in the weather",
    subtitle: "A small report from the neighborhood",
    topic: "Nature",
    emoji: "☔",
    color: "#DBE8F1",
    format: "News-style",
    versions: [
      {
        lines: [
          ["今天下雨了。", "It is raining today."],
          ["天气很冷。", "The weather is cold."],
          ["我不去学校。", "I am not going to school."],
          ["我在家看书，喝茶。", "I read books and drink tea at home."],
          ["明天天气怎么样？", "What will the weather be like tomorrow?"],
        ],
        grammar:
          "天气 + adjective describes the weather. No 是 is needed: 天气很冷。",
        check: [
          "Where is the speaker today?",
          "At home",
          ["At home", "At school", "At the airport"],
          "我在家看书，喝茶。The speaker is at home.",
        ],
        reply: [
          "Type the Chinese word for rain (to rain).",
          "下雨",
          "下雨 · xià yǔ · to rain",
        ],
      },
      {
        lines: [
          [
            "昨天很晴，今天下雨了。",
            "Yesterday was sunny, but today it is raining.",
          ],
          [
            "因为天气很冷，所以我穿了很多衣服。",
            "Because the weather is cold, I put on many clothes.",
          ],
          [
            "朋友打电话问我：“你还来吗？”",
            "My friend called and asked, “Are you still coming?”",
          ],
          ["我说：“我坐公共汽车来。”", "I said, “I will come by bus.”"],
          ["我们都希望明天是晴天。", "We all hope tomorrow is sunny."],
        ],
        grammar:
          "因为…所以… gives a reason and a result. You can use both words in the same sentence in Chinese.",
        check: [
          "How will the speaker travel?",
          "By bus",
          ["By bus", "By plane", "By bicycle"],
          "我坐公共汽车来。The speaker will come by bus.",
        ],
        reply: ["Type the Chinese word for cold.", "冷", "冷 · lěng · cold"],
      },
      {
        lines: [
          ["最近天气变化很大。", "Recently the weather has changed a lot."],
          [
            "昨天还有太阳，今天突然下雨了。",
            "Yesterday there was still sunshine; today it suddenly rained.",
          ],
          [
            "很多人带着伞去上班。",
            "Many people go to work carrying umbrellas.",
          ],
          [
            "新闻说，明天可能还会下雨。",
            "The news says it may rain again tomorrow.",
          ],
          [
            "出门以前，我们应该看看天气。",
            "Before going out, we should check the weather.",
          ],
        ],
        grammar:
          "着 describes a continuing state: 带着伞 means carrying an umbrella. 以前 means before.",
        check: [
          "What should people do before going out?",
          "Check the weather",
          ["Check the weather", "Buy a ticket", "Call a doctor"],
          "出门以前，我们应该看看天气。Check the weather before leaving.",
        ],
        reply: [
          "Type the Chinese word for umbrella.",
          "伞",
          "伞 · sǎn · umbrella",
        ],
      },
    ],
  },
  {
    id: "market",
    title: "The apple stand",
    subtitle: "Good food, a little conversation",
    topic: "Food",
    emoji: "🍎",
    color: "#F7DBCE",
    format: "Story",
    versions: [
      {
        lines: [
          ["今天我去商店。", "Today I go to the shop."],
          ["这里有苹果和茶。", "There are apples and tea here."],
          ["苹果多少钱？", "How much are the apples?"],
          ["一个苹果三块钱。", "An apple costs three yuan."],
          ["我买三个苹果。", "I buy three apples."],
        ],
        grammar:
          "多少钱 asks a price. 块 is a common spoken word for yuan: 三块钱。",
        check: [
          "How much is one apple?",
          "Three yuan",
          ["Three yuan", "Ten yuan", "Six yuan"],
          "一个苹果三块钱。An apple costs three yuan.",
        ],
        reply: ["Type the Chinese verb for to buy.", "买", "买 · mǎi · to buy"],
      },
      {
        lines: [
          ["这个商店离我家很近。", "This shop is very close to my home."],
          ["苹果比西瓜便宜。", "The apples are cheaper than the watermelon."],
          ["我买了两公斤苹果。", "I bought two kilograms of apples."],
          [
            "服务员说：“这些苹果很好吃。”",
            "The shop assistant says, “These apples are delicious.”",
          ],
          ["我还给妈妈买了牛奶。", "I also bought milk for Mom."],
        ],
        grammar:
          "A 比 B + adjective compares two things: 苹果比西瓜便宜。Use 两 before a measure word: 两公斤。",
        check: [
          "What does the speaker buy for Mom?",
          "Milk",
          ["Milk", "Coffee", "A newspaper"],
          "我还给妈妈买了牛奶。The speaker buys Mom milk.",
        ],
        reply: [
          "Type the Chinese word for inexpensive.",
          "便宜",
          "便宜 · pián yi · inexpensive",
        ],
      },
      {
        lines: [
          [
            "周末，我和邻居一起去了超市。",
            "At the weekend, my neighbor and I went to the supermarket.",
          ],
          [
            "这里的水果又新鲜又便宜。",
            "The fruit here is both fresh and inexpensive.",
          ],
          [
            "除了苹果，我们还买了香蕉和葡萄。",
            "Besides apples, we also bought bananas and grapes.",
          ],
          ["我把水果放在包里。", "I put the fruit in my bag."],
          [
            "回家以后，我们一起做了果汁。",
            "After returning home, we made juice together.",
          ],
        ],
        grammar:
          "又…又… pairs two qualities. 把 + object + action + result/location focuses on what happens to an object.",
        check: [
          "What do they make at home?",
          "Fruit juice",
          ["Fruit juice", "A cake", "Noodles"],
          "我们一起做了果汁。They make fruit juice together.",
        ],
        reply: [
          "Type the Chinese word for fresh.",
          "新鲜",
          "新鲜 · xīn xiān · fresh",
        ],
      },
    ],
  },
  {
    id: "train",
    title: "A ticket to somewhere",
    subtitle: "A small journey, a new view",
    topic: "Travel",
    emoji: "🚆",
    color: "#DCE5EE",
    format: "Story",
    versions: [
      {
        lines: [
          ["明天我去北京。", "Tomorrow I am going to Beijing."],
          ["今天我去火车站。", "Today I go to the train station."],
          ["我想买一张票。", "I want to buy a ticket."],
          ["现在是下午三点。", "It is three in the afternoon now."],
          ["朋友在这里。我们很高兴。", "My friend is here. We are happy."],
        ],
        grammar:
          "想 + verb expresses a wish. 张 counts flat objects such as tickets: 一张票。",
        check: [
          "Where is the speaker going tomorrow?",
          "Beijing",
          ["Beijing", "The hospital", "Home"],
          "明天我去北京。The speaker is going to Beijing.",
        ],
        reply: [
          "Type the Chinese word for train station.",
          "火车站",
          "火车站 · huǒ chē zhàn · train station",
        ],
      },
      {
        lines: [
          ["明天我要去北京旅游。", "Tomorrow I am going to Beijing to travel."],
          ["我已经买了两张票。", "I have already bought two tickets."],
          ["火车站离我家很远。", "The train station is far from my home."],
          [
            "我准备和朋友一起坐出租车去。",
            "I plan to take a taxi there with my friend.",
          ],
          ["我们希望早点到。", "We hope to arrive a little earlier."],
        ],
        grammar:
          "已经 + verb + 了 means an action is already completed. 要 can express an upcoming plan.",
        check: [
          "How will they get to the station?",
          "By taxi",
          ["By taxi", "On foot", "By plane"],
          "坐出租车去。They will take a taxi.",
        ],
        reply: [
          "Type the Chinese word for ticket.",
          "票",
          "票 · piào · ticket",
        ],
      },
      {
        lines: [
          [
            "去北京以前，我检查了自己的包。",
            "Before going to Beijing, I checked my bag.",
          ],
          [
            "票和护照都在里面，但是手机不见了。",
            "The ticket and passport were inside, but my phone was missing.",
          ],
          [
            "我有点着急，马上回房间找。",
            "I was a bit anxious and immediately went back to my room to look.",
          ],
          ["我发现手机在桌子下面。", "I found my phone under the table."],
          [
            "我终于到火车站了，朋友正在门口等我。",
            "I finally reached the train station; my friend was waiting for me at the entrance.",
          ],
        ],
        grammar:
          "以前 puts an event before another. 不见了 means has disappeared or is missing. 终于 marks a long-awaited outcome.",
        check: [
          "Where was the phone?",
          "Under the table",
          ["Under the table", "On the train", "In the bag"],
          "手机在桌子下面。The phone was under the table.",
        ],
        reply: [
          "Type the Chinese word for passport.",
          "护照",
          "护照 · hù zhào · passport",
        ],
      },
    ],
  },
  {
    id: "books",
    title: "A place for more stories",
    subtitle: "A neighborhood reading report",
    topic: "Community",
    emoji: "📚",
    color: "#E6DCF1",
    format: "News-style",
    versions: [
      {
        lines: [
          ["学校有很多书。", "There are many books at school."],
          ["老师喜欢看书。", "The teacher likes reading."],
          ["学生在这里读书。", "Students read here."],
          ["我和朋友看一本书。", "My friend and I read a book."],
          ["我们很高兴。", "We are happy."],
        ],
        grammar:
          "本 is the measure word for books: 一本书。读书 can mean reading or studying.",
        check: [
          "Where are the books?",
          "At school",
          ["At school", "In a taxi", "At the hospital"],
          "学校有很多书。There are many books at school.",
        ],
        reply: ["Type the Chinese word for book.", "书", "书 · shū · book"],
      },
      {
        lines: [
          [
            "学校旁边有一个看书的地方。",
            "There is a place to read next to the school.",
          ],
          [
            "这里的书很多，也很新。",
            "There are many books here, and they are new too.",
          ],
          ["孩子们每天都来这里。", "Children come here every day."],
          [
            "大家可以看书，还可以学习汉语。",
            "Everyone can read books and also study Chinese.",
          ],
          [
            "老师说：“欢迎你们来！”",
            "The teacher says, “You are welcome to come!”",
          ],
        ],
        grammar:
          "Verb phrase + 的 + noun modifies a noun: 看书的地方 means a place for reading.",
        check: [
          "What can people study here?",
          "Chinese",
          ["Chinese", "Swimming", "Cooking"],
          "还可以学习汉语。People can also study Chinese.",
        ],
        reply: [
          "Type the Chinese word for welcome.",
          "欢迎",
          "欢迎 · huān yíng · welcome",
        ],
      },
      {
        lines: [
          ["附近开了一个新的图书馆。", "A new library has opened nearby."],
          [
            "除了借书，大家还可以一起读书。",
            "Besides borrowing books, everyone can read together.",
          ],
          [
            "一位老师每个周末都给孩子们讲故事。",
            "A teacher tells stories to the children every weekend.",
          ],
          [
            "有些孩子以前不喜欢看书，现在很有兴趣。",
            "Some children did not like reading before, but now they are very interested.",
          ],
          [
            "邻居们认为，这个地方让大家更快乐。",
            "The neighbors think this place makes everyone happier.",
          ],
        ],
        grammar:
          "除了…还… adds another possibility. 位 is a polite measure word for people.",
        check: [
          "What does a teacher do on weekends?",
          "Tell children stories",
          ["Tell children stories", "Sell vegetables", "Drive a bus"],
          "给孩子们讲故事。The teacher tells stories to children.",
        ],
        reply: [
          "Type the Chinese word for library.",
          "图书馆",
          "图书馆 · tú shū guǎn · library",
        ],
      },
    ],
  },
  {
    id: "birthday",
    title: "A very small surprise",
    subtitle: "A day for someone you love",
    topic: "Daily life",
    emoji: "🎂",
    color: "#F6DFE7",
    format: "Story",
    versions: [
      {
        lines: [
          ["今天是妈妈的生日。", "Today is Mom’s birthday."],
          ["爸爸买了水果。", "Dad bought fruit."],
          ["我买了一本书。", "I bought a book."],
          ["妈妈喜欢这本书。", "Mom likes this book."],
          ["我们都很高兴。", "We are all happy."],
        ],
        grammar:
          "的 marks possession: 妈妈的生日。了 after a verb can show a completed action.",
        check: [
          "What did the speaker buy?",
          "A book",
          ["A book", "A phone", "Tea"],
          "我买了一本书。The speaker bought a book.",
        ],
        reply: ["Type the Chinese word for mom.", "妈妈", "妈妈 · mā ma · mom"],
      },
      {
        lines: [
          ["今天是妈妈的生日。", "Today is Mom’s birthday."],
          [
            "姐姐正在做饭，我在买东西。",
            "My older sister is cooking, and I am shopping.",
          ],
          ["我给妈妈买了一件红衣服。", "I bought Mom a red piece of clothing."],
          ["晚上我们一起唱歌。", "In the evening, we sing together."],
          [
            "妈妈说：“谢谢你们，我很快乐！”",
            "Mom says, “Thank you all. I am very happy!”",
          ],
        ],
        grammar:
          "给 + person can mark the recipient before an action: 给妈妈买衣服。件 counts items of clothing.",
        check: [
          "What color is the clothing?",
          "Red",
          ["Red", "Black", "White"],
          "一件红衣服。The clothing is red.",
        ],
        reply: [
          "Type the Chinese word for birthday.",
          "生日",
          "生日 · shēng rì · birthday",
        ],
      },
      {
        lines: [
          [
            "为了给妈妈一个特别的生日，我们准备了很久。",
            "We prepared for a long time to give Mom a special birthday.",
          ],
          [
            "姐姐做了蛋糕，我选择了一个礼物。",
            "My sister made a cake, and I chose a gift.",
          ],
          [
            "妈妈回家以后，我们一起唱歌。",
            "After Mom returned home, we sang together.",
          ],
          ["她又高兴又满意。", "She was both happy and satisfied."],
          [
            "我们祝妈妈生日快乐，身体健康。",
            "We wished Mom a happy birthday and good health.",
          ],
        ],
        grammar:
          "为了 introduces a purpose. 祝 + person + wish gives good wishes: 祝妈妈生日快乐。",
        check: [
          "Who made the cake?",
          "The older sister",
          ["The older sister", "Mom", "A neighbor"],
          "姐姐做了蛋糕。The older sister made the cake.",
        ],
        reply: [
          "Type the Chinese word for gift.",
          "礼物",
          "礼物 · lǐ wù · gift",
        ],
      },
    ],
  },
  {
    id: "park",
    title: "A greener afternoon",
    subtitle: "A little walk makes a difference",
    topic: "Nature",
    emoji: "🌳",
    color: "#DCEBC8",
    format: "News-style",
    versions: [
      {
        lines: [
          ["今天天气很好。", "The weather is nice today."],
          ["我和爸爸出去。", "Dad and I go out."],
          ["这里有很多人。", "There are many people here."],
          ["我们看见一只小鸟。", "We see a little bird."],
          ["爸爸说：“它很漂亮！”", "Dad says, “It is beautiful!”"],
        ],
        grammar:
          "看见 focuses on the result of looking: seeing something. 个 counts people; 只 counts birds.",
        check: [
          "What do they see?",
          "A little bird",
          ["A little bird", "A plane", "A cat"],
          "我们看见一只小鸟。They see a little bird.",
        ],
        reply: [
          "Type the Chinese word for beautiful.",
          "漂亮",
          "漂亮 · piào liang · beautiful",
        ],
      },
      {
        lines: [
          [
            "学校旁边有一个很大的地方。",
            "There is a large place next to the school.",
          ],
          [
            "大家每天都来这里运动。",
            "Everyone comes here every day to exercise.",
          ],
          ["早上，很多人在跑步。", "In the morning, many people are running."],
          ["下午，孩子们一起玩。", "In the afternoon, children play together."],
          ["我觉得这里非常好。", "I think this place is very nice."],
        ],
        grammar:
          "在 + verb can describe an action in progress: 很多人在跑步。觉得 introduces a personal impression.",
        check: [
          "What do many people do in the morning?",
          "Run",
          ["Run", "Read newspapers", "Cook"],
          "很多人在跑步。Many people are running.",
        ],
        reply: [
          "Type the Chinese word for to run.",
          "跑步",
          "跑步 · pǎo bù · to run",
        ],
      },
      {
        lines: [
          [
            "最近，附近的公园更干净了。",
            "Recently, the nearby park has become cleaner.",
          ],
          [
            "每个周末，邻居们都来这里帮忙。",
            "Every weekend, the neighbors come here to help.",
          ],
          [
            "有的人打扫，有的人照顾花和树。",
            "Some people clean, and others look after the flowers and trees.",
          ],
          [
            "孩子们一边玩，一边了解花和树。",
            "The children play while learning about flowers and trees.",
          ],
          [
            "大家都认为，好的环境需要一起努力。",
            "Everyone thinks a good environment needs a shared effort.",
          ],
        ],
        grammar:
          "一边…一边… describes two actions happening together. 更 + adjective means even more: 更干净 means cleaner.",
        check: [
          "Who helps in the park?",
          "The neighbors",
          ["The neighbors", "Only teachers", "Only tourists"],
          "邻居们都来这里帮忙。The neighbors come to help.",
        ],
        reply: [
          "Type the Chinese word for park.",
          "公园",
          "公园 · gōng yuán · park",
        ],
      },
    ],
  },
  {
    id: "phone",
    title: "A message from home",
    subtitle: "Small technology, big connection",
    topic: "Technology",
    emoji: "📱",
    color: "#D8E7ED",
    format: "Story",
    versions: [
      {
        lines: [
          ["我在中国学习。", "I study in China."],
          ["妈妈不在中国。", "Mom is not in China."],
          ["今天我给妈妈打电话。", "Today I call Mom."],
          ["妈妈问：“你好吗？”", "Mom asks, “How are you?”"],
          ["我说：“我很好！”", "I say, “I am very well!”"],
        ],
        grammar:
          "打电话 means to make a phone call. 给 + person marks who receives it: 给妈妈打电话。",
        check: [
          "Who does the speaker call?",
          "Mom",
          ["Mom", "A doctor", "A teacher"],
          "我给妈妈打电话。The speaker calls Mom.",
        ],
        reply: [
          "Type the Chinese word for China.",
          "中国",
          "中国 · zhōng guó · China",
        ],
      },
      {
        lines: [
          [
            "我每天都用手机给妈妈打电话。",
            "Every day I use my phone to call Mom.",
          ],
          ["今天手机没电了。", "Today my phone ran out of battery."],
          [
            "我在学校用电脑和妈妈说话。",
            "At school, I use a computer to talk with Mom.",
          ],
          [
            "我告诉她，我认识了很多新朋友。",
            "I tell her I have made many new friends.",
          ],
          ["妈妈听了很高兴。", "Mom is happy to hear that."],
        ],
        grammar:
          "没 negates a completed action or possession. 了 can mark a new situation: 手机没电了。",
        check: [
          "What does the speaker use today?",
          "A computer",
          ["A computer", "A new phone", "A television"],
          "我在学校用电脑。The speaker uses a computer at school.",
        ],
        reply: [
          "Type the Chinese word for computer.",
          "电脑",
          "电脑 · diàn nǎo · computer",
        ],
      },
      {
        lines: [
          [
            "奶奶以前不太会用手机。",
            "Grandma did not really know how to use a smartphone before.",
          ],
          [
            "为了和我们说话，她决定认真学习。",
            "To talk with us, she decided to study carefully.",
          ],
          [
            "我先教她打电话，然后教她看照片。",
            "I first taught her to make calls, then to view photos.",
          ],
          [
            "虽然有点难，但是她一直练习。",
            "Although it was a bit difficult, she kept practicing.",
          ],
          ["现在她每天都给我们看照片。", "Now she shows us photos every day."],
        ],
        grammar:
          "会 + verb describes a learned skill. 先…然后… sequences teaching steps.",
        check: [
          "What did Grandma learn first?",
          "Making calls",
          ["Making calls", "Taking photos", "Playing games"],
          "我先教她打电话。Making calls came first.",
        ],
        reply: [
          "Type the Chinese word for to practice.",
          "练习",
          "练习 · liàn xí · to practice",
        ],
      },
    ],
  },
  {
    id: "language",
    title: "One sentence at a time",
    subtitle: "The joy of being understood",
    topic: "Learning",
    emoji: "💬",
    color: "#E6E3F5",
    format: "Story",
    versions: [
      {
        lines: [
          ["我是学生。", "I am a student."],
          ["我学习汉语。", "I study Chinese."],
          ["老师说：“你好！”", "The teacher says, “Hello!”"],
          ["我说：“老师好！”", "I say, “Hello, teacher!”"],
          ["我们都很高兴。", "We are all happy."],
        ],
        grammar:
          "老师好 is a polite greeting. Chinese word order often follows subject + verb + object: 我学习汉语。",
        check: [
          "What does the speaker study?",
          "Chinese",
          ["Chinese", "Cooking", "Music"],
          "我学习汉语。The speaker studies Chinese.",
        ],
        reply: [
          "Type the Chinese word for teacher.",
          "老师",
          "老师 · lǎo shī · teacher",
        ],
      },
      {
        lines: [
          [
            "我学习汉语已经三个月了。",
            "I have been studying Chinese for three months.",
          ],
          [
            "每天我都读书，还听老师说话。",
            "Every day I read and also listen to the teacher speak.",
          ],
          [
            "有时候我不懂，就问老师。",
            "Sometimes I do not understand, so I ask the teacher.",
          ],
          [
            "今天我和一个中国朋友说了很多话。",
            "Today I talked a lot with a Chinese friend.",
          ],
          ["我觉得学习汉语很快乐。", "I think learning Chinese is joyful."],
        ],
        grammar:
          "已经…了 can describe a duration continuing to now. 不懂 means do not understand; 问 means to ask.",
        check: [
          "How long has the speaker studied?",
          "Three months",
          ["Three months", "Three years", "Three days"],
          "已经三个月了。The speaker has studied for three months.",
        ],
        reply: [
          "Type the Chinese word for to understand.",
          "懂",
          "懂 · dǒng · to understand",
        ],
      },
      {
        lines: [
          [
            "开始学习汉语的时候，我很害怕说错。",
            "When I first started learning Chinese, I was afraid of speaking incorrectly.",
          ],
          [
            "老师告诉我，说错了也可以学习。",
            "The teacher told me that I can learn even when I say something wrong.",
          ],
          [
            "我决定每天练习一个简单的句子。",
            "I decided to practice one simple sentence every day.",
          ],
          [
            "遇到不认识的词语，我就用字典检查。",
            "When I meet words I do not know, I check them with a dictionary.",
          ],
          [
            "现在我的水平提高了，也更愿意说汉语了。",
            "Now my level has improved, and I am more willing to speak Chinese.",
          ],
        ],
        grammar:
          "的时候 means when. 遇到…就… links a situation and the action it triggers.",
        check: [
          "What does the speaker practice every day?",
          "One simple sentence",
          ["One simple sentence", "A long speech", "An entire book"],
          "每天练习一个简单的句子。The speaker practices one simple sentence.",
        ],
        reply: [
          "Type the Chinese word for dictionary.",
          "字典",
          "字典 · zì diǎn · dictionary",
        ],
      },
    ],
  },
  {
    id: "music",
    title: "Music through the window",
    subtitle: "A little culture on a Sunday",
    topic: "Culture",
    emoji: "🎵",
    color: "#F3DECA",
    format: "News-style",
    versions: [
      {
        lines: [
          ["今天是星期日。", "Today is Sunday."],
          ["我和朋友在学校。", "My friend and I are at school."],
          ["老师在唱歌。", "The teacher is singing."],
          ["我们都喜欢听。", "We all like listening."],
          ["朋友说：“很好听！”", "My friend says, “It sounds very nice!”"],
        ],
        grammar:
          "好听 describes something pleasant to hear. 在 + verb can describe something happening now.",
        check: [
          "Who is singing?",
          "The teacher",
          ["The teacher", "The speaker", "Mom"],
          "老师在唱歌。The teacher is singing.",
        ],
        reply: [
          "Type the Chinese word for friend.",
          "朋友",
          "朋友 · péng you · friend",
        ],
      },
      {
        lines: [
          [
            "今天晚上，大家都在学校唱歌。",
            "This evening, everyone is singing at school.",
          ],
          ["我的姐姐也来了。", "My older sister has come too."],
          ["她唱得非常好。", "She sings very well."],
          [
            "很多孩子一边唱歌，一边跳舞。",
            "Many children sing and also dance.",
          ],
          ["大家都很快乐。", "Everyone is happy."],
        ],
        grammar:
          "Verb + 得 + description expresses how an action is done: 唱得非常好。",
        check: [
          "How does the sister sing?",
          "Very well",
          ["Very well", "Very quietly", "Very slowly"],
          "她唱得非常好。She sings very well.",
        ],
        reply: [
          "Type the Chinese word for to dance.",
          "跳舞",
          "跳舞 · tiào wǔ · to dance",
        ],
      },
      {
        lines: [
          [
            "周末，附近的学校举行了一个音乐表演。",
            "At the weekend, a nearby school held a music event.",
          ],
          [
            "学生们准备了很多有意思的节目。",
            "The students prepared many interesting performances.",
          ],
          [
            "有的人唱歌，有的人表演跳舞。",
            "Some sang, and some performed dances.",
          ],
          [
            "我最喜欢最后一个节目，因为它介绍了很多国家的文化。",
            "I liked the last performance best because it introduced the cultures of different countries.",
          ],
          [
            "表演结束以后，大家还在一起说话。",
            "After the event ended, everyone was still chatting together.",
          ],
        ],
        grammar:
          "有的人…有的人… divides people into groups. 因为 explains why the speaker prefers something.",
        check: [
          "Why does the speaker like the last performance?",
          "It introduces different cultures",
          [
            "It introduces different cultures",
            "It is very short",
            "It has no music",
          ],
          "它介绍了很多国家的文化。It introduces cultures from different countries.",
        ],
        reply: [
          "Type the Chinese word for music.",
          "音乐",
          "音乐 · yīn yuè · music",
        ],
      },
    ],
  },
  {
    id: "help",
    title: "A good day to help",
    subtitle: "Little kindnesses around the corner",
    topic: "Community",
    emoji: "🤝",
    color: "#DDEADF",
    format: "Story",
    versions: [
      {
        lines: [
          ["今天我去学校。", "Today I go to school."],
          ["我看见一个老师。", "I see a teacher."],
          ["老师有很多书。", "The teacher has many books."],
          ["我说：“我来！”", "I say, “Let me!”"],
          ["老师说：“谢谢你！”", "The teacher says, “Thank you!”"],
        ],
        grammar:
          "我来 can mean “let me do it” when offering to take a turn. 谢谢你 is a direct expression of thanks.",
        check: [
          "What does the teacher have?",
          "Many books",
          ["Many books", "Apples", "Clothes"],
          "老师有很多书。The teacher has many books.",
        ],
        reply: [
          "Type the Chinese word for thank you.",
          "谢谢",
          "谢谢 · xiè xie · thank you",
        ],
      },
      {
        lines: [
          ["今天我坐公共汽车去学校。", "Today I take a bus to school."],
          ["车上有一个老人。", "There is an older person on the bus."],
          ["他很累，我请他坐。", "He is tired, so I invite him to sit."],
          ["他笑着说：“谢谢你！”", "He smiles and says, “Thank you!”"],
          ["我回答：“不客气！”", "I reply, “You are welcome!”"],
        ],
        grammar:
          "请 + person + action politely invites someone to do something. 不客气 responds to thanks.",
        check: [
          "Why does the speaker offer a seat?",
          "The older person is tired",
          [
            "The older person is tired",
            "The bus is empty",
            "The speaker is at home",
          ],
          "他很累，我请他坐。The older person is tired.",
        ],
        reply: [
          "Type the Chinese phrase for you’re welcome.",
          "不客气",
          "不客气 · bù kè qi · you’re welcome",
        ],
      },
      {
        lines: [
          [
            "昨天，我在楼下遇到了一位新邻居。",
            "Yesterday I met a new neighbor downstairs.",
          ],
          [
            "她拿着很多东西，很累。",
            "She was holding many things and was tired.",
          ],
          ["我问她：“你需要帮忙吗？”", "I asked her, “Do you need help?”"],
          [
            "我们一起把东西搬到了她的房间。",
            "Together we moved the things to her room.",
          ],
          [
            "她说：“谢谢你！”还请我喝了一杯茶。",
            "She said, “Thank you!” and also invited me to have a cup of tea.",
          ],
        ],
        grammar:
          "拿着 describes holding something. 把 + object + 搬到 + location expresses moving an object to its destination.",
        check: [
          "What do they move together?",
          "Her things",
          ["Her things", "A tree", "A bus"],
          "一起把东西搬到了她的房间。They move her things to her room.",
        ],
        reply: [
          "Type the Chinese word for neighbor.",
          "邻居",
          "邻居 · lín jū · neighbor",
        ],
      },
    ],
  },
  {
    id: "arrival",
    title: "Welcome to Chengdu",
    subtitle: "Lele meets Dashan at the station",
    topic: "Travel",
    emoji: "🚄",
    color: "#DCECF6",
    format: "Story",
    versions: [
      {
        lines: [
          ["你好！你是大山吗？", "Hello! Are you Dashan?", "L"],
          ["是，我是大山。你是乐乐吗？", "Yes, I'm Dashan. Are you Lele?", "D"],
          ["是。很高兴认识你！", "I am. Very nice to meet you!", "L"],
          ["我也很高兴。成都很大！", "I'm glad too. Chengdu is big!", "D"],
          ["你想喝茶吗？", "Would you like some tea?", "L"],
          ["想！谢谢你。", "I would! Thank you.", "D"],
        ],
        grammar:
          "A 吗 question is answered with its verb, not with yes or no: 你是大山吗？→ 是。你想喝茶吗？→ 想。",
        check: [
          "Which city does Dashan arrive in?",
          "Chengdu",
          ["Chengdu", "Beijing", "He does not say"],
          "成都很大！Chengdu is big!",
        ],
        reply: [
          "Type the Chinese name of the city.",
          "成都",
          "成都 · chéng dū · Chengdu",
        ],
      },
      {
        lines: [
          [
            "大山，你到了！欢迎来成都。",
            "Dashan, you've arrived! Welcome to Chengdu.",
            "L",
          ],
          ["谢谢你来火车站。", "Thank you for coming to the station.", "D"],
          ["路上累不累？", "Was the journey tiring?", "L"],
          [
            "不累。这是我第一次来成都，我非常高兴。",
            "Not at all. This is my first time in Chengdu, and I'm very happy.",
            "D",
          ],
          [
            "我家离这里不远，我们走吧。",
            "My home isn't far from here. Let's walk.",
            "L",
          ],
          [
            "好！你说得很慢，我都听懂了。",
            "Great! You speak slowly, so I understood everything.",
            "D",
          ],
        ],
        grammar:
          "离 measures the distance between two places: 我家离这里不远。Verb + 得 + adjective says how something is done: 你说得很慢。",
        check: [
          "How will they get to Lele's home?",
          "On foot",
          ["On foot", "By taxi", "By train"],
          "我家离这里不远，我们走吧。My home isn't far from here. Let's walk.",
        ],
        reply: [
          "Type the Chinese for “not far”.",
          "不远",
          "不远 · bù yuǎn · not far",
        ],
      },
      {
        lines: [
          [
            "大山！我终于看见你了，欢迎来成都。",
            "Dashan! I finally get to see you. Welcome to Chengdu.",
            "L",
          ],
          [
            "谢谢你来接我。路上人很多，但是我不觉得累。",
            "Thank you for coming to meet me. It was crowded on the way, but I don't feel tired.",
            "D",
          ],
          [
            "你是第一次来这个城市吧？",
            "This is your first time in this city, isn't it?",
            "L",
          ],
          [
            "是的，以前我只在照片上看过成都。",
            "Yes. Before, I had only seen Chengdu in photos.",
            "D",
          ],
          [
            "那我先带你去喝茶，然后我们去公园。",
            "Then I'll take you for tea first, and after that we'll go to the park.",
            "L",
          ],
          [
            "太好了！我一直想看看成都人怎么喝茶。",
            "Wonderful! I've always wanted to see how people in Chengdu drink tea.",
            "D",
          ],
        ],
        grammar:
          "先 … 然后 … puts two actions in order: 我先带你去喝茶，然后我们去公园。Verb + 过 marks an experience: 我只在照片上看过成都。",
        check: [
          "How had Dashan seen Chengdu before this trip?",
          "Only in photos",
          ["Only in photos", "On an earlier visit", "He had never seen it"],
          "以前我只在照片上看过成都。Before, I had only seen Chengdu in photos.",
        ],
        reply: [
          "Type the Chinese word for “finally”.",
          "终于",
          "终于 · zhōng yú · finally",
        ],
      },
    ],
  },
  {
    id: "teahouse",
    title: "Tea in the park",
    subtitle: "A slow afternoon at the teahouse",
    topic: "Culture",
    emoji: "🍵",
    color: "#E4F3D6",
    format: "Story",
    versions: [
      {
        lines: [
          ["这是茶馆。", "This is a teahouse.", "L"],
          ["人很多！", "So many people!", "D"],
          ["你喝什么茶？", "What tea will you have?", "L"],
          ["我想喝热茶。", "I'd like hot tea.", "D"],
          ["好。我也喝热茶。", "All right. I'll have hot tea too.", "L"],
          ["这个茶很好喝！", "This tea is delicious!", "D"],
          ["我们在这里坐坐。", "Let's sit here for a while.", "L"],
        ],
        grammar:
          "什么 asks “what” and stays where the answer goes: 你喝什么茶？→ 我喝热茶。Doubling a verb, as in 坐坐, makes it light and casual.",
        check: [
          "What does Dashan want to drink?",
          "Hot tea",
          ["Hot tea", "Cold water", "Coffee"],
          "我想喝热茶。I'd like hot tea.",
        ],
        reply: [
          "Type the Chinese word for “teahouse”.",
          "茶馆",
          "茶馆 · chá guǎn · teahouse",
        ],
      },
      {
        lines: [
          [
            "成都人喜欢在公园里喝茶。",
            "People in Chengdu like to drink tea in the park.",
            "L",
          ],
          [
            "大家都在说话，没有人看手机！",
            "Everyone is talking, and nobody is looking at a phone!",
            "D",
          ],
          [
            "是啊。在这里，时间走得很慢。",
            "That's right. Here, time moves slowly.",
            "L",
          ],
          ["你看，服务员来了。", "Look, the waiter is coming.", "D"],
          ["他来给我们送热水。", "He's bringing us hot water.", "L"],
          [
            "一杯茶可以喝一个下午吗？",
            "Can one cup of tea last a whole afternoon?",
            "D",
          ],
          [
            "可以！所以我每个星期都来。",
            "It can! That's why I come every week.",
            "L",
          ],
        ],
        grammar:
          "在 + verb shows an action in progress: 大家都在说话。每 … 都 … means “every …”: 我每个星期都来。",
        check: [
          "How often does Lele come to the teahouse?",
          "Every week",
          ["Every week", "Every day", "Once a year"],
          "我每个星期都来。I come every week.",
        ],
        reply: [
          "Type the Chinese word for “waiter”.",
          "服务员",
          "服务员 · fú wù yuán · waiter",
        ],
      },
      {
        lines: [
          [
            "这家茶馆已经有一百年的历史了。",
            "This teahouse already has a hundred years of history.",
            "L",
          ],
          [
            "所以这里的桌子和椅子都很旧。",
            "So that's why the tables and chairs here are so old.",
            "D",
          ],
          [
            "旧是旧，但是坐着很舒服。",
            "Old they may be, but they're comfortable to sit in.",
            "L",
          ],
          [
            "我发现客人除了喝茶，还在这里看书、说话。",
            "I notice the guests don't only drink tea; they also read and talk here.",
            "D",
          ],
          [
            "成都人觉得，茶馆就像自己的家一样。",
            "People in Chengdu feel a teahouse is just like their own home.",
            "L",
          ],
          [
            "我明白了。在这里，慢慢喝茶才是最重要的。",
            "I see. Here, drinking your tea slowly is what matters most.",
            "D",
          ],
        ],
        grammar:
          "A 是 A，但是 … concedes a point before a contrast: 旧是旧，但是坐着很舒服。除了 … 还 … adds to what was said: 除了喝茶，还在这里看书。",
        check: [
          "How old is the teahouse?",
          "About a hundred years",
          ["About a hundred years", "About ten years", "It opened this year"],
          "这家茶馆已经有一百年的历史了。This teahouse already has a hundred years of history.",
        ],
        reply: [
          "Type the Chinese word for “comfortable”.",
          "舒服",
          "舒服 · shū fu · comfortable",
        ],
      },
    ],
  },
  {
    id: "pandas",
    title: "Breakfast with Pangpang",
    subtitle: "An early visit to the panda base",
    topic: "Nature",
    emoji: "🐼",
    color: "#D6EFCB",
    format: "Story",
    versions: [
      {
        lines: [
          ["你看！那是胖胖。", "Look! That's Pangpang.", "L"],
          ["胖胖很大！", "Pangpang is big!", "D"],
          ["胖胖在吃东西。", "Pangpang is eating.", "L"],
          ["熊猫吃什么？", "What do pandas eat?", "D"],
          ["熊猫爱吃竹子。", "Pandas love to eat bamboo.", "L"],
          ["胖胖吃了很多竹子！", "Pangpang has eaten a lot of bamboo!", "D"],
          [
            "熊猫上午吃，下午睡觉。",
            "Pandas eat in the morning and sleep in the afternoon.",
            "L",
          ],
        ],
        grammar:
          "在 + verb says what is happening right now: 胖胖在吃东西。爱 + verb means “love to”: 熊猫爱吃竹子。",
        check: [
          "What do pandas love to eat?",
          "Bamboo",
          ["Bamboo", "Apples", "Rice"],
          "熊猫爱吃竹子。Pandas love to eat bamboo.",
        ],
        reply: [
          "Type the Chinese word for “panda”.",
          "熊猫",
          "熊猫 · xióng māo · panda",
        ],
      },
      {
        lines: [
          [
            "我们来得很早，因为熊猫早上吃饭。",
            "We came early because pandas eat in the morning.",
            "L",
          ],
          [
            "那只熊猫真可爱！它正在看着我们。",
            "That panda is so cute! It's looking at us.",
            "D",
          ],
          [
            "它叫胖胖，已经三岁了。",
            "Its name is Pangpang, and it's already three.",
            "L",
          ],
          ["它一天吃多少竹子？", "How much bamboo does it eat in a day?", "D"],
          ["很多！它比你吃得多。", "A lot! It eats more than you do.", "L"],
          [
            "吃完就睡觉，我也想做熊猫！",
            "Eat, then sleep. I want to be a panda too!",
            "D",
          ],
        ],
        grammar:
          "A 比 B + 得 + adjective compares how two things do something: 它比你吃得多。Verb + 完 + 就 … means one thing follows straight after another: 吃完就睡觉。",
        check: [
          "Why did they come early?",
          "Pandas eat in the morning",
          [
            "Pandas eat in the morning",
            "The park closes at noon",
            "Tickets are cheaper",
          ],
          "因为熊猫早上吃饭。Because pandas eat in the morning.",
        ],
        reply: [
          "Type the Chinese word for “bamboo”.",
          "竹子",
          "竹子 · zhú zi · bamboo",
        ],
      },
      {
        lines: [
          [
            "熊猫是中国特别有名的动物，很多人为了看它们来成都。",
            "The panda is an especially famous animal in China, and many people come to Chengdu just to see them.",
            "L",
          ],
          [
            "我以前以为熊猫总是在睡觉，没想到它们吃得非常快。",
            "I used to think pandas were always asleep. I didn't expect them to eat so fast.",
            "D",
          ],
          [
            "一只大熊猫一天要吃很多竹子，所以它们需要很长时间吃饭。",
            "A giant panda has to eat a great deal of bamboo every day, so they need a long time for their meals.",
            "L",
          ],
          [
            "你看胖胖，它把竹子都吃完了。",
            "Look at Pangpang: it has eaten up all the bamboo.",
            "D",
          ],
          [
            "这里的人照顾它们照顾得很认真。",
            "The people here look after them very carefully.",
            "L",
          ],
          [
            "我决定了，下次来成都，我还要先来看胖胖。",
            "I've decided: next time I come to Chengdu, I'll come to see Pangpang first again.",
            "D",
          ],
        ],
        grammar:
          "把 moves the object in front of the verb to say what is done to it: 它把竹子都吃完了。没想到 … introduces a surprise: 没想到它们吃得非常快。",
        check: [
          "What surprised Dashan?",
          "How fast pandas eat",
          [
            "How fast pandas eat",
            "How small pandas are",
            "How few visitors there were",
          ],
          "没想到它们吃得非常快。I didn't expect them to eat so fast.",
        ],
        reply: [
          "Type the Chinese word for “animal”.",
          "动物",
          "动物 · dòng wù · animal",
        ],
      },
    ],
  },
];
