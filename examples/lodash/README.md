# Refactoring lodash helper(?) function "equalByTag"
While trying to learn everything about lodash and it's design, I came across this function written in switch statement.

Out of curiosity I refactored it using Compare. The result is kept in [this file](./refactored.js). Since syntax is not fully tested so bug is guaranteed, however the refactoring definitely have significant improvement to readability and, even though I'm not an expert, I believe scalability as well.
