// Word bank: level number -> a block of [word, sentence containing the exact word].
// All blocks are 2nd-grade reading level; each level is a little harder than the last
// (level 1 = short, simple words ... level 5 = longer words and trickier spellings).
// Later this can come from a backend (see loadWords in game.js).
window.WORD_BANK = {
  1: [
    ['ran', 'I ran to the big red barn.'],
    ['rain', 'The rain fell on my coat.'],
    ['man', 'The man waved at us.'],
    ['main', 'The main door is open.'],
    ['pan', 'The pan is hot.'],
    ['pain', 'The cut caused some pain.'],
    ['pad', 'I wrote a note on my pad.'],
    ['paid', 'Dad paid for the food.']
  ],
  2: [
    ['plan', 'We made a plan for the day.'],
    ['plain', 'The plain shirt is clean.'],
    ['snail', 'A snail moved across the leaf.'],
    ['mail', 'The mail came today.'],
    ['tail', 'The dog wagged its tail.'],
    ['train', 'The train moved down the track.'],
    ['paint', 'We used blue paint.'],
    ['wait', 'Please wait by the door.']
  ],
  3: [
    ['men', 'The men walked down the road.'],
    ['mean', 'What does this word mean?'],
    ['bet', 'I bet we can win.'],
    ['beat', 'We beat the drum.'],
    ['met', 'I met my friend at school.'],
    ['meat', 'The dog ate its meat.'],
    ['bed', 'The cat slept on the bed.'],
    ['bead', 'A blue bead fell on the floor.']
  ],
  4: [
    ['set', 'I set the book on the desk.'],
    ['seat', 'Please take your seat.'],
    ['feast', 'We had a feast at the party.'],
    ['cheap', 'This toy was cheap.'],
    ['team', 'Our team played well.'],
    ['read', 'I read a book each night.'],
    ['eat', 'We eat lunch at noon.'],
    ['clean', 'I clean my room each day.']
  ],
  5: [
    ['rainbow', 'A rainbow shone after the rain.'],
    ['teacher', 'My teacher read us a story.'],
    ['paintbrush', 'I used a paintbrush to make art.'],
    ['peanut', 'The squirrel found a peanut.']
  ]
};
