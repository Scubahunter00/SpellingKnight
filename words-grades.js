// Word banks by grade: grade -> level (1-5) -> [word, sentence containing the exact word].
// Grade 2 is the original bank from words.js. Within a grade, each level is a little harder.
// Later this can come from a backend (see loadWords in game.js).
window.WORD_BANKS = {
  1: {
    1: [
      ['cat', 'The cat naps on the mat.'], ['dog', 'My dog likes to run.'], ['sun', 'The sun is hot today.'],
      ['hat', 'I wear a hat in the sun.'], ['red', 'The apple is red.'], ['big', 'An elephant is big.'],
      ['run', 'I can run very fast.'], ['sit', 'Please sit on the chair.'], ['cup', 'I drink milk from a cup.'],
      ['bed', 'I go to bed at night.'], ['pig', 'The pig rolls in the mud.'], ['hop', 'A bunny can hop.'],
      ['mom', 'My mom reads to me.'], ['box', 'The toy is in the box.']
    ],
    2: [
      ['ship', 'The ship sails on the sea.'], ['frog', 'The frog sits on a log.'], ['stop', 'Stop at the red light.'],
      ['nest', 'The bird made a nest.'], ['milk', 'I like cold milk.'], ['ball', 'Kick the ball to me.'],
      ['door', 'Please shut the door.'], ['farm', 'The cow lives on a farm.'], ['fast', 'The car goes fast.'],
      ['gift', 'I gave her a gift.'], ['hand', 'Raise your hand to talk.'], ['lamp', 'Turn on the lamp.'],
      ['snow', 'The snow is cold and white.'], ['duck', 'The duck swims in the pond.']
    ],
    3: [
      ['apple', 'I ate a red apple.'], ['happy', 'The puppy is happy.'], ['water', 'Drink some water.'],
      ['green', 'The grass is green.'], ['house', 'We live in a small house.'], ['mouse', 'A mouse ran under the bed.'],
      ['train', 'The train goes choo choo.'], ['clock', 'The clock says it is noon.'], ['plant', 'I water the plant.'],
      ['sleep', 'The baby will sleep now.'], ['bread', 'I like warm bread.'], ['smile', 'Her smile is bright.'],
      ['horse', 'The horse eats hay.'], ['queen', 'The queen wears a crown.']
    ],
    4: [
      ['night', 'The stars shine at night.'], ['light', 'Turn on the light.'], ['bring', 'Please bring your book.'],
      ['shell', 'I found a shell on the beach.'], ['cloud', 'A cloud floats in the sky.'], ['beach', 'We dig in the sand at the beach.'],
      ['sheep', 'The sheep has soft wool.'], ['brush', 'I brush my teeth.'], ['grass', 'The cows eat grass.'],
      ['truck', 'The truck carries logs.'], ['stone', 'He skipped a stone on the lake.'], ['tiger', 'The tiger has stripes.'],
      ['spoon', 'Eat your soup with a spoon.'], ['paint', 'We paint with bright colors.']
    ],
    5: [
      ['yellow', 'The duck is yellow.'], ['purple', 'She wore a purple dress.'], ['orange', 'I peeled an orange.'],
      ['planet', 'Earth is our planet.'], ['rocket', 'The rocket flew to the moon.'], ['turtle', 'The turtle is slow.'],
      ['dragon', 'The dragon breathes fire.'], ['bridge', 'We walked over the bridge.'], ['kitten', 'The kitten drinks milk.'],
      ['rabbit', 'The rabbit eats a carrot.'], ['summer', 'We swim in the summer.'], ['winter', 'It snows in winter.'],
      ['pencil', 'I write with a pencil.'], ['garden', 'Flowers grow in the garden.']
    ]
  },
  3: {
    1: [
      ['bright', 'The moon is bright tonight.'], ['carry', 'Can you carry this bag?'], ['early', 'We woke up early.'],
      ['fruit', 'An apple is a fruit.'], ['giant', 'The giant stepped over the hill.'], ['heavy', 'The box is too heavy.'],
      ['leave', 'We leave for school at eight.'], ['music', 'We sing music in class.'], ['noise', 'The noise woke the baby.'],
      ['quick', 'The fox is quick.'], ['round', 'A ball is round.'], ['shout', 'Do not shout in the library.'],
      ['smooth', 'The stone is smooth.'], ['clever', 'The clever fox found a way out.']
    ],
    2: [
      ['bottle', 'Fill your water bottle.'], ['button', 'A button fell off my coat.'], ['circle', 'We sat in a circle.'],
      ['dinner', 'Dinner is ready.'], ['finger', 'I hurt my finger.'], ['golden', 'The knight found a golden key.'],
      ['jungle', 'Monkeys live in the jungle.'], ['kitchen', 'Mom cooks in the kitchen.'], ['market', 'We buy fruit at the market.'],
      ['mirror', 'I looked in the mirror.'], ['number', 'Pick a number from one to ten.'], ['pocket', 'I have a coin in my pocket.'],
      ['rescue', 'The knight came to rescue us.'], ['basket', 'Put the eggs in the basket.']
    ],
    3: [
      ['captain', 'The captain steered the ship.'], ['chicken', 'The chicken laid an egg.'], ['country', 'We drove across the country.'],
      ['evening', 'We eat supper in the evening.'], ['journey', 'The journey took three days.'], ['machine', 'The machine makes a loud hum.'],
      ['mountain', 'We climbed the tall mountain.'], ['message', 'I left you a message.'], ['morning', 'Good morning, class!'],
      ['picture', 'She drew a picture of a castle.'], ['quarter', 'A quarter is worth twenty-five cents.'], ['science', 'We do an experiment in science.'],
      ['thunder', 'The thunder was very loud.'], ['village', 'A small village sits by the river.']
    ],
    4: [
      ['library', 'I borrow books from the library.'], ['medicine', 'Take your medicine with water.'], ['neighbor', 'My neighbor has a big dog.'],
      ['perfect', 'I got a perfect score.'], ['popular', 'That game is very popular.'], ['question', 'May I ask a question?'],
      ['remember', 'Please remember your lunch.'], ['strength', 'The knight showed great strength.'], ['surprise', 'We planned a surprise party.'],
      ['tomorrow', 'We go to the zoo tomorrow.'], ['wonderful', 'It was a wonderful day.'], ['weather', 'The weather is sunny.'],
      ['whisper', 'Whisper in the library.'], ['trouble', 'The little goblin was in trouble.']
    ],
    5: [
      ['adventure', 'The knight went on an adventure.'], ['ancient', 'The ancient castle was crumbling.'], ['brilliant', 'She had a brilliant idea.'],
      ['collect', 'I collect shiny rocks.'], ['compare', 'Compare the two drawings.'], ['creature', 'A strange creature hid in the cave.'],
      ['delicious', 'The soup was delicious.'], ['describe', 'Describe your favorite toy.'], ['discover', 'We discover new things each day.'],
      ['enormous', 'An enormous bear walked by.'], ['explore', 'Let us explore the cave.'], ['imagine', 'Imagine a flying horse.'],
      ['important', 'It is important to be kind.'], ['knowledge', 'Books give us knowledge.']
    ]
  },
  4: {
    1: [
      ['against', 'The knight leaned against the wall.'], ['attempt', 'I will attempt to jump the gap.'], ['balance', 'Balance on one foot.'],
      ['borrow', 'May I borrow your pencil?'], ['chapter', 'Read the next chapter tonight.'], ['curious', 'The cat was curious about the box.'],
      ['decide', 'We must decide which way to go.'], ['diamond', 'The ring had a diamond.'], ['engine', 'The engine started with a roar.'],
      ['forward', 'Take one step forward.'], ['general', 'The general led the army.'], ['gentle', 'Be gentle with the baby bird.'],
      ['honest', 'An honest person tells the truth.'], ['insect', 'An insect has six legs.']
    ],
    2: [
      ['journal', 'I write in my journal each night.'], ['justice', 'The king wanted justice for all.'], ['language', 'She speaks a different language.'],
      ['lantern', 'He carried a lantern through the cave.'], ['marvel', 'We marvel at the tall waterfall.'], ['measure', 'Measure the board before you cut it.'],
      ['mixture', 'Stir the mixture slowly.'], ['natural', 'It is natural to feel nervous.'], ['nervous', 'I felt nervous before the test.'],
      ['observe', 'Observe the ants carefully.'], ['opinion', 'What is your opinion of the book?'], ['parade', 'We watched the parade go by.'],
      ['passage', 'A secret passage led to the tower.'], ['pattern', 'The quilt has a pretty pattern.']
    ],
    3: [
      ['peaceful', 'The lake was calm and peaceful.'], ['pioneer', 'A pioneer crossed the wide plains.'], ['plenty', 'We have plenty of time.'],
      ['potion', 'The wizard stirred the potion.'], ['prepare', 'Prepare for the big battle.'], ['pressure', 'Feel the pressure of the water.'],
      ['protect', 'A shield can protect you.'], ['purpose', 'What is the purpose of this tool?'], ['receive', 'I hope to receive a letter.'],
      ['reflect', 'A mirror will reflect light.'], ['remain', 'Please remain in your seat.'], ['respect', 'Show respect to your elders.'],
      ['section', 'Read the first section aloud.'], ['shadow', 'My shadow follows me.']
    ],
    4: [
      ['signal', 'The knight gave a signal.'], ['silence', 'There was silence in the cave.'], ['similar', 'The twins look similar.'],
      ['skeleton', 'A skeleton guarded the door.'], ['sleeve', 'My sleeve got caught on a nail.'], ['southern', 'Birds fly to the southern lands.'],
      ['spirit', 'The ghost is a restless spirit.'], ['stomach', 'My stomach growled.'], ['storage', 'Put the box in storage.'],
      ['stranger', 'A stranger knocked at the gate.'], ['structure', 'The tall structure was made of stone.'], ['suddenly', 'Suddenly the lights went out.'],
      ['support', 'Pillars support the roof.'], ['squirrel', 'A squirrel hid an acorn.']
    ],
    5: [
      ['temperature', 'The temperature dropped at night.'], ['thousand', 'The dragon guarded a thousand coins.'], ['tradition', 'Singing is a family tradition.'],
      ['transport', 'Ships transport goods across the sea.'], ['unusual', 'That is an unusual rock.'], ['vacation', 'We went to the lake on vacation.'],
      ['valuable', 'The gem is very valuable.'], ['vegetable', 'Carrots are a healthy vegetable.'], ['victory', 'The team celebrated its victory.'],
      ['weapon', 'The knight raised his weapon.'], ['whistle', 'The coach blew the whistle.'], ['wisdom', 'The old wizard had great wisdom.'],
      ['yesterday', 'Yesterday we found a map.'], ['volcano', 'Lava poured from the volcano.']
    ]
  },
  5: {
    1: [
      ['accident', 'It was an accident.'], ['achieve', 'Work hard to achieve your goals.'], ['advice', 'She gave me good advice.'],
      ['appear', 'Stars appear at night.'], ['argument', 'They had an argument about the game.'], ['audience', 'The audience clapped loudly.'],
      ['average', 'The average score was eighty.'], ['bargain', 'The sword was a real bargain.'], ['boundary', 'A fence marks the boundary.'],
      ['calendar', 'Mark the day on the calendar.'], ['canyon', 'The river carved a deep canyon.'], ['capture', 'Try to capture the flag.'],
      ['ceiling', 'Bats hung from the ceiling.'], ['challenge', 'The quiz was a real challenge.']
    ],
    2: [
      ['champion', 'The champion lifted the trophy.'], ['character', 'My favorite character is the knight.'], ['citizen', 'Every citizen can vote.'],
      ['climate', 'The climate here is warm.'], ['community', 'Our community built a new park.'], ['companion', 'A dog is a loyal companion.'],
      ['courage', 'It takes courage to try again.'], ['creative', 'She is very creative.'], ['culture', 'We learned about another culture.'],
      ['customer', 'The customer paid for the apples.'], ['damage', 'The storm did great damage.'], ['decision', 'It was a hard decision.'],
      ['delicate', 'The glass is delicate.'], ['develop', 'Seeds develop into plants.']
    ],
    3: [
      ['dictionary', 'Look it up in the dictionary.'], ['direction', 'Which direction should we go?'], ['disaster', 'The flood was a disaster.'],
      ['distance', 'The castle was a long distance away.'], ['document', 'Sign the document.'], ['earthquake', 'The earthquake shook the town.'],
      ['education', 'Education helps us grow.'], ['emergency', 'Call for help in an emergency.'], ['energy', 'I have lots of energy.'],
      ['equipment', 'Pack your camping equipment.'], ['evidence', 'We found evidence of a thief.'], ['excellent', 'You did an excellent job.'],
      ['exchange', 'Let us exchange gifts.'], ['expedition', 'The expedition crossed the desert.']
    ],
    4: [
      ['familiar', 'That song sounds familiar.'], ['festival', 'The town held a festival.'], ['fortune', 'The pirate found a fortune in gold.'],
      ['frequent', 'Storms are frequent in spring.'], ['furniture', 'We moved the furniture.'], ['generous', 'The king was generous.'],
      ['genuine', 'The coin is genuine gold.'], ['glacier', 'A glacier is a river of ice.'], ['graceful', 'The dancer was graceful.'],
      ['guardian', 'A guardian watched over the gate.'], ['harbor', 'The ship sailed into the harbor.'], ['hazard', 'Ice is a hazard on the road.'],
      ['hesitate', 'Do not hesitate to ask.'], ['horizon', 'The sun sank below the horizon.']
    ],
    5: [
      ['independent', 'She is a very independent girl.'], ['ingredient', 'Flour is the main ingredient.'], ['instrument', 'The flute is a musical instrument.'],
      ['invisible', 'The ghost became invisible.'], ['legendary', 'The legendary knight saved the land.'], ['lightning', 'Lightning flashed in the sky.'],
      ['magnificent', 'The castle was magnificent.'], ['mysterious', 'A mysterious light glowed in the cave.'], ['necessary', 'Sleep is necessary for health.'],
      ['ordinary', 'It was an ordinary day.'], ['parachute', 'The parachute floated down slowly.'], ['persuade', 'I will persuade him to come.'],
      ['privilege', 'It is a privilege to meet you.'], ['responsible', 'A responsible knight guards the gate.']
    ]
  }
};
window.WORD_BANKS[2] = window.WORD_BANK;
