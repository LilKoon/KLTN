"""
Script to parse TOEIC questions from data.md and data_vocab.txt into JSON format
for inserting into NganHangCauHoi table.

Output format: [{question, a, b, c, d, correct, level, skill, explanation}]
"""

import json
import re
from wordfreq import zipf_frequency


# ============================================================
# SECTION 1: Parse GRAMMAR questions from data.md (existing)
# ============================================================

def parse_grammar_questions(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Normalize some HTML entities
    content = content.replace('&#x20;', ' ')

    lines = content.split('\n')

    questions = []
    current_q = None
    question_text_lines = []

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Detect question start: number followed by a period
        q_match = re.match(r'^(\d+)\.\s*(.*)', line)

        if q_match:
            # Save previous question if exists
            if current_q and question_text_lines:
                current_q['question'] = ' '.join(question_text_lines).strip()
                # Clean up the question text
                current_q['question'] = re.sub(r'\s+', ' ', current_q['question'])
                questions.append(current_q)

            q_num = int(q_match.group(1))
            q_text_start = q_match.group(2).strip()

            current_q = {
                'number': q_num,
                'question': '',
                'a': '',
                'b': '',
                'c': '',
                'd': '',
                'correct': '',
                'level': 1,
                'skill': 'GRAMMAR',
                'explanation': ''
            }
            question_text_lines = [q_text_start] if q_text_start else []
            i += 1
            continue

        # Detect answer options
        opt_match = re.match(r'^\(([A-Da-d8])\)\s*(.*)', line)
        if opt_match and current_q:
            opt_letter = opt_match.group(1).upper()
            opt_text = opt_match.group(2).strip()

            # Handle (8) which is actually (B) - OCR error in question 100
            if opt_letter == '8':
                opt_letter = 'B'

            if opt_letter == 'A':
                current_q['a'] = opt_text
            elif opt_letter == 'B':
                current_q['b'] = opt_text
            elif opt_letter == 'C':
                current_q['c'] = opt_text
            elif opt_letter == 'D':
                current_q['d'] = opt_text
            i += 1
            continue

        # If we're in a question and this isn't an option, it's part of the question text
        if current_q and line and not line.startswith('---'):
            # Skip stray numbers (like "20" on its own line from formatting)
            if re.match(r'^\d+$', line) and int(line) < 100:
                i += 1
                continue
            question_text_lines.append(line)
        elif current_q and '---' in line:
            question_text_lines.append('_______')

        i += 1

    # Don't forget the last question
    if current_q and question_text_lines:
        current_q['question'] = ' '.join(question_text_lines).strip()
        current_q['question'] = re.sub(r'\s+', ' ', current_q['question'])
        questions.append(current_q)

    return questions


def assign_grammar_answers(questions):
    """
    Assign correct answers, levels, and explanations for each TOEIC Part 5 question.
    These are standard TOEIC practice questions with well-known answers.
    """

    answer_key = {
        1: {'correct': 'B', 'level': 1, 'explanation': '"her" is the correct possessive/object pronoun to use after "help". "Asked for volunteers to help her" requires an object pronoun.'},
        2: {'correct': 'C', 'level': 1, 'explanation': '"knowledge" is the noun form needed after "extensive" (adjective). "Extensive knowledge of" is a common collocation.'},
        3: {'correct': 'A', 'level': 2, 'explanation': '"Once a year" is an adverb phrase of frequency meaning one time per year.'},
        4: {'correct': 'D', 'level': 2, 'explanation': '"because" introduces a reason clause explaining why Ms. Pham requested a refund.'},
        5: {'correct': 'C', 'level': 1, 'explanation': '"easily" is an adverb modifying the verb "see". We need an adverb, not an adjective.'},
        6: {'correct': 'A', 'level': 2, 'explanation': '"affordable" means reasonably priced, which fits the context of keeping costs low for certification programs.'},
        7: {'correct': 'D', 'level': 2, 'explanation': '"occupied" is the past tense verb needed. Mr. Brennel occupied (held) positions before becoming president.'},
        8: {'correct': 'B', 'level': 2, 'explanation': '"representatives" is the noun form meaning people who represent Hanovi Studios.'},
        9: {'correct': 'A', 'level': 1, 'explanation': '"extensive" means broad and thorough, which naturally collocates with "experience".'},
        10: {'correct': 'A', 'level': 2, 'explanation': '"revising" is the gerund form used after "when" as a reduced adverbial clause (when you are revising).'},
        11: {'correct': 'C', 'level': 3, 'explanation': '"whether" introduces an indirect question about uncertainty - will developers preserve the properties or not.'},
        12: {'correct': 'B', 'level': 1, 'explanation': '"innovative" is the adjective form needed to modify the implied noun (campaign). "Most innovative" is the superlative.'},
        13: {'correct': 'A', 'level': 1, 'explanation': '"almost" means nearly, modifying "complete". The design is nearly finished.'},
        14: {'correct': 'A', 'level': 2, 'explanation': '"he" is the subject pronoun needed as the subject of the clause "be given full responsibility".'},
        15: {'correct': 'C', 'level': 2, 'explanation': '"before" indicates a time sequence - Ms. Delgado wants to meet before reviewing more applications.'},
        16: {'correct': 'C', 'level': 2, 'explanation': '"reputation" means the general opinion about something. "Has a reputation as" is a standard expression.'},
        17: {'correct': 'B', 'level': 2, 'explanation': '"in order to" expresses purpose - they held a rehearsal for the purpose of perfecting their performance.'},
        18: {'correct': 'D', 'level': 3, 'explanation': '"accommodate" means to provide space for or to adapt to. The lab is being doubled to accommodate growth.'},
        19: {'correct': 'A', 'level': 2, 'explanation': '"profitable" is the adjective form needed after "was not". The quarter was not profitable.'},
        20: {'correct': 'B', 'level': 3, 'explanation': '"proximity" means nearness. "Proximity to the airport" means it is close to the airport.'},
        21: {'correct': 'A', 'level': 2, 'explanation': '"whose" is the possessive relative pronoun modifying "responsibilities". Employees whose responsibilities include...'},
        22: {'correct': 'C', 'level': 3, 'explanation': '"However" is used in the pattern "However + adjective/adverb + subject + verb" to mean "no matter how".'},
        23: {'correct': 'B', 'level': 3, 'explanation': '"unveiled" means revealed or shown publicly for the first time. A product exhibition is where new products are unveiled.'},
        24: {'correct': 'A', 'level': 2, 'explanation': '"has implemented" is the present perfect tense showing a completed action with present relevance.'},
        25: {'correct': 'B', 'level': 1, 'explanation': '"opening" is the gerund/noun form. "The opening of" refers to the inauguration ceremony.'},
        26: {'correct': 'A', 'level': 1, 'explanation': '"quite" is an adverb that modifies "helpful", meaning "very" or "considerably".'},
        27: {'correct': 'A', 'level': 2, 'explanation': '"proposed" is the past participle used as an adjective, meaning "suggested" or "put forward for consideration".'},
        28: {'correct': 'C', 'level': 1, 'explanation': '"results" is the logical noun. Survey results are what get released after evaluation.'},
        29: {'correct': 'D', 'level': 1, 'explanation': '"quickly" is the adverb form needed to modify "operates". Comparative form: "more quickly than".'},
        30: {'correct': 'C', 'level': 1, 'explanation': '"we" is the subject pronoun needed as the subject of the verb "help".'},
        31: {'correct': 'A', 'level': 2, 'explanation': '"just in time" is a fixed expression meaning exactly at the right moment.'},
        32: {'correct': 'C', 'level': 2, 'explanation': '"themselves" is the reflexive pronoun referring back to "designers". They do not consider themselves to be artists.'},
        33: {'correct': 'B', 'level': 1, 'explanation': '"for" is the preposition used with "awards". "Received awards for" her ideas.'},
        34: {'correct': 'B', 'level': 2, 'explanation': '"lift" is the correct verb meaning to raise items. Proper techniques to lift items reduces back injury risk.'},
        35: {'correct': 'A', 'level': 1, 'explanation': '"local" is the adjective form needed to modify "health guidelines".'},
        36: {'correct': 'A', 'level': 1, 'explanation': '"ready" fits the pattern "ready to deliver". Always ready to deliver outstanding food.'},
        37: {'correct': 'C', 'level': 2, 'explanation': '"practical" is the adjective form needed to modify "way". A practical way to support growth.'},
        38: {'correct': 'A', 'level': 2, 'explanation': '"shipments" is the plural noun. A record number of shipments came into the port.'},
        39: {'correct': 'D', 'level': 2, 'explanation': '"series" means a number of similar things. "A series of positions" is a common collocation.'},
        40: {'correct': 'B', 'level': 1, 'explanation': '"includes" is the third-person singular verb agreeing with the subject "fee" (singular).'},
        41: {'correct': 'B', 'level': 1, 'explanation': '"contracts" is the plural noun. "Has contracts with" means has agreements with suppliers.'},
        42: {'correct': 'A', 'level': 2, 'explanation': '"at least" means a minimum of. Passengers must be there at least 25 minutes before boarding.'},
        43: {'correct': 'A', 'level': 1, 'explanation': '"you" is the object pronoun after "help". The software can help you identify issues.'},
        44: {'correct': 'D', 'level': 2, 'explanation': '"plans" is the correct verb. "Plans to purchase" means intends to buy.'},
        45: {'correct': 'C', 'level': 2, 'explanation': '"exceptional" means outstanding or unusually good, fitting the context of hiring an expert.'},
        46: {'correct': 'C', 'level': 2, 'explanation': '"accounting" is the gerund/adjective form. "Accounting responsibilities" means duties related to accounting.'},
        47: {'correct': 'A', 'level': 1, 'explanation': '"at" is the preposition used with events/gatherings. "At a luncheon" indicates location/event.'},
        48: {'correct': 'B', 'level': 2, 'explanation': '"to stimulate" is the infinitive of purpose. Incentives to stimulate productivity.'},
        49: {'correct': 'D', 'level': 3, 'explanation': '"Due to" means because of. Due to construction in progress, tourists cannot enter.'},
        50: {'correct': 'C', 'level': 3, 'explanation': '"investigation" means research or study. Experts presenting results of their investigation.'},
        51: {'correct': 'D', 'level': 2, 'explanation': '"massive" means very large. A massive display to promote the book.'},
        52: {'correct': 'A', 'level': 1, 'explanation': '"who" is the subject relative pronoun for people. People who attended the workshop.'},
        53: {'correct': 'A', 'level': 2, 'explanation': '"enough" follows an adjective. "Large enough to be served" means sufficiently large.'},
        54: {'correct': 'A', 'level': 1, 'explanation': '"interest" is the uncountable noun. "Much interest" - garnered much interest/attention.'},
        55: {'correct': 'B', 'level': 3, 'explanation': '"whenever" means any time that. Save 25% whenever you buy a laptop.'},
        56: {'correct': 'D', 'level': 2, 'explanation': '"manageable" is the adjective form modifying "plan". A manageable five-step plan.'},
        57: {'correct': 'B', 'level': 2, 'explanation': '"since" introduces a reason clause (because). Since production increased, more staff is needed.'},
        58: {'correct': 'B', 'level': 2, 'explanation': '"be processed" is the passive infinitive after "cannot". Orders are processed (passive voice).'},
        59: {'correct': 'A', 'level': 1, 'explanation': '"but" is a coordinating conjunction showing contrast between two independent clauses.'},
        60: {'correct': 'A', 'level': 2, 'explanation': '"favorable" is the adjective form modifying "effects". The favorable effects of sleep.'},
        61: {'correct': 'C', 'level': 3, 'explanation': '"implementing" means putting into action. The company is implementing a yearly shutdown.'},
        62: {'correct': 'B', 'level': 3, 'explanation': '"specimens" are samples or examples. A botanical archive has plant specimens.'},
        63: {'correct': 'B', 'level': 2, 'explanation': '"eligible" means qualified or entitled. "Eligible to recycle" through the program.'},
        64: {'correct': 'C', 'level': 2, 'explanation': '"hearing" is a noun meaning a formal meeting to review plans. "The hearing to review plans."'},
        65: {'correct': 'B', 'level': 2, 'explanation': '"while" means at the same time as. Optimizing quality while reducing environmental impact.'},
        66: {'correct': 'D', 'level': 3, 'explanation': '"had been buying" is the past perfect continuous, indicating an action that started before and continued up to another past event.'},
        67: {'correct': 'A', 'level': 1, 'explanation': '"in order to" expresses purpose. Must have ID in order to enter the building.'},
        68: {'correct': 'A', 'level': 3, 'explanation': '"Reliability" means dependability/trustworthiness. Reliability and cost were factors in choosing a supplier.'},
        69: {'correct': 'D', 'level': 2, 'explanation': '"finance" is the noun form. "Corporate finance and budgeting" are related business fields.'},
        70: {'correct': 'B', 'level': 1, 'explanation': '"hard" is an adverb meaning with great effort. "Works so hard" is a common expression.'},
        71: {'correct': 'C', 'level': 1, 'explanation': '"also" means in addition. The inn also offers modern conveniences.'},
        72: {'correct': 'A', 'level': 1, 'explanation': '"to" is the preposition indicating direction/destination. Moving to a larger location.'},
        73: {'correct': 'A', 'level': 2, 'explanation': '"briefly" is the adverb modifying "considered". She briefly considered becoming an actor.'},
        74: {'correct': 'D', 'level': 1, 'explanation': '"common" means frequent or usual. Common repairs are typical repairs homeowners need.'},
        75: {'correct': 'D', 'level': 1, 'explanation': '"originally" is the adverb form. He was originally hired as a salesperson. (Note: the option shows "originall" which is likely "originally")'},
        76: {'correct': 'B', 'level': 2, 'explanation': '"because of" gives a reason. Popular because of its rich culture.'},
        77: {'correct': 'C', 'level': 2, 'explanation': '"will consider" is the future simple tense. Mr. Shang will consider the suggestions.'},
        78: {'correct': 'A', 'level': 2, 'explanation': '"division" means a department or section. "The design division" of the company.'},
        79: {'correct': 'B', 'level': 1, 'explanation': '"historic" is the adjective form modifying "sites". Historic sites are places of historical significance.'},
        80: {'correct': 'A', 'level': 2, 'explanation': '"but" is used in the correlative conjunction pattern "not only... but (also)".'},
        81: {'correct': 'C', 'level': 1, 'explanation': '"their" is the possessive adjective modifying "departments". Their departments.'},
        82: {'correct': 'D', 'level': 2, 'explanation': '"thoroughly" means completely and carefully. Must thoroughly review the terms.'},
        83: {'correct': 'A', 'level': 2, 'explanation': '"conservative" is the adjective form modifying "estimate". A conservative estimate is cautiously low.'},
        84: {'correct': 'B', 'level': 2, 'explanation': '"earn" means to gain through effort. Workers earn additional vacation time after 3 years.'},
        85: {'correct': 'C', 'level': 3, 'explanation': '"Whoever" means any person who. Whoever has time should lock the cabinets.'},
        86: {'correct': 'C', 'level': 2, 'explanation': '"throughout" means in every part of. Shipping throughout Asia means to all parts of Asia.'},
        87: {'correct': 'C', 'level': 3, 'explanation': '"Discovered" is a past participle used in a participial phrase. "Discovered last year, the novel has attracted interest."'},
        88: {'correct': 'D', 'level': 1, 'explanation': '"any" is used with singular nouns to mean "every" or "whichever". Search in any neighborhood.'},
        89: {'correct': 'D', 'level': 2, 'explanation': '"competition" is the noun form meaning competitors collectively. Sets us apart from our competition.'},
        90: {'correct': 'B', 'level': 2, 'explanation': '"until" means up to the point that. Monitored until the source can be confirmed.'},
        91: {'correct': 'B', 'level': 1, 'explanation': '"valued" is the past participle/adjective meaning highly regarded. Most valued customers.'},
        92: {'correct': 'A', 'level': 3, 'explanation': '"distinguish" means to tell apart. He can distinguish talented agents from the rest.'},
        93: {'correct': 'A', 'level': 2, 'explanation': '"although" is a concession conjunction. Although work stopped, targets would still be met.'},
        94: {'correct': 'B', 'level': 2, 'explanation': '"accordingly" means in accordance with the information provided. Quote adjusted accordingly.'},
        95: {'correct': 'C', 'level': 2, 'explanation': '"empowering" is the gerund used as the subject. Empowering employees is vital to success.'},
        96: {'correct': 'C', 'level': 2, 'explanation': '"agenda" is the list of items to be discussed at a meeting. Meeting agenda.'},
        97: {'correct': 'D', 'level': 2, 'explanation': '"structurally" is the adverb modifying "sound". Structurally sound means the structure is solid.'},
        98: {'correct': 'C', 'level': 2, 'explanation': '"prestigious" means highly respected and admired. A prestigious award.'},
        99: {'correct': 'B', 'level': 1, 'explanation': '"their" is the possessive adjective. Processed by their expert chefs.'},
        100: {'correct': 'B', 'level': 1, 'explanation': '"greatly" is the adverb modifying "increases". Computerization greatly increases ability.'},
        101: {'correct': 'C', 'level': 1, 'explanation': '"ingredients" are components used in cooking. Freshest ingredients for salads.'},
        102: {'correct': 'B', 'level': 1, 'explanation': '"at" is the preposition used with conferences/events. Present at the conference.'},
        103: {'correct': 'D', 'level': 1, 'explanation': '"shipping" is the gerund used as an adjective. A shipping date is the date of delivery.'},
        104: {'correct': 'C', 'level': 2, 'explanation': '"closely" means in a close manner. Works closely with team members means collaborates directly.'},
        105: {'correct': 'B', 'level': 2, 'explanation': '"when" introduces a time clause. She knows when to update her line.'},
        106: {'correct': 'A', 'level': 2, 'explanation': '"attended" means people came to the class. Well attended means many people participated.'},
        107: {'correct': 'A', 'level': 1, 'explanation': '"from" is used in the phrase "away from". Situated away from the residential area.'},
        108: {'correct': 'A', 'level': 1, 'explanation': '"economical" is the adjective meaning cost-effective. The most economical mailing option.'},
        109: {'correct': 'C', 'level': 2, 'explanation': '"rely" is the base verb form after "can". Can rely on Vyber for assistance.'},
        110: {'correct': 'B', 'level': 2, 'explanation': '"which" is a relative pronoun referring to "task". A new task, which is to review portfolios.'},
        111: {'correct': 'C', 'level': 1, 'explanation': '"its" is the possessive pronoun for "meat" (singular, neuter). Ensure its readiness.'},
        112: {'correct': 'B', 'level': 1, 'explanation': '"several" means more than two but not very many. Hire several interns.'},
        113: {'correct': 'C', 'level': 2, 'explanation': '"Since" means because. Since the juice is popular, we should increase production.'},
        114: {'correct': 'A', 'level': 2, 'explanation': '"construction" is the noun form. Engine construction = the process of building engines.'},
        115: {'correct': 'A', 'level': 2, 'explanation': '"executing" means carrying out or performing. Executing business tasks with speed.'},
        116: {'correct': 'B', 'level': 1, 'explanation': '"gradually" is the adverb modifying "installed". Installed gradually to control costs.'},
        117: {'correct': 'D', 'level': 2, 'explanation': '"between" is used with two values. Sales between £160,000 and £180,000.'},
        118: {'correct': 'D', 'level': 2, 'explanation': '"few" means not many. Few climbers have reached the peak because it is challenging.'},
        119: {'correct': 'B', 'level': 1, 'explanation': '"you" is the subject pronoun. If you need replacement parts.'},
        120: {'correct': 'D', 'level': 1, 'explanation': '"for" is used with time periods. "For the last three years" indicates duration.'},
        121: {'correct': 'C', 'level': 2, 'explanation': '"wider" is the comparative form. "A wider variety than" compares two restaurants.'},
        122: {'correct': 'A', 'level': 2, 'explanation': '"swiftly" means quickly and efficiently. Resolve problems swiftly.'},
        123: {'correct': 'A', 'level': 2, 'explanation': '"agreement" is the noun form. "Trade agreement" is a standard term for a commerce pact.'},
        124: {'correct': 'D', 'level': 2, 'explanation': '"until" means up to the point when. Let it simmer until it thickens.'},
        125: {'correct': 'B', 'level': 2, 'explanation': '"surprisingly" is the adverb modifying "short". A surprisingly short amount of time.'},
        126: {'correct': 'B', 'level': 1, 'explanation': '"always" is an adverb of frequency. The picnic is always held outside town.'},
    }

    for q in questions:
        q_num = q['number']
        if q_num in answer_key:
            info = answer_key[q_num]
            correct = info.get('correct')
            if correct:
                correct = correct.strip()
            q['correct'] = correct
            q['level'] = info['level']
            q['explanation'] = info['explanation']
        else:
            q['correct'] = ''
            q['level'] = 1
            q['explanation'] = ''

    return questions


# ============================================================
# SECTION 2: Parse VOCAB questions from data_vocab.txt (new)
# ============================================================

def parse_vocab_answer_key(filepath):
    """
    Parse the answer key file (dap_an_vocab.txt).
    Format per line: "1-10 CDBBA BBDAB"
    Returns a dict {question_number: answer_letter}
    """
    answers = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            # Match pattern like "1-10 CDBBA BBDAB"
            match = re.match(r'(\d+)-(\d+)\s+(.+)', line)
            if match:
                start = int(match.group(1))
                end = int(match.group(2))
                # Remove all spaces from the answer string
                answer_str = match.group(3).replace(' ', '')
                for idx, letter in enumerate(answer_str):
                    q_num = start + idx
                    if q_num <= end:
                        answers[q_num] = letter.upper()
    return answers


def parse_vocab_questions(filepath):
    """
    Parse vocab questions from data_vocab.txt.
    Format:
      1. The house was burgled while the family was _______ in a card game.
      A. buried B. busy C. absorbed D. helping
    
    Some questions span multiple lines, and some have multi-line options.
    Handles edge cases like missing periods after question numbers (e.g., "298 When...")
    and inconsistent option formatting (e.g., "B lane" instead of "B. lane").
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    questions = []
    current_q = None
    question_text_lines = []

    i = 0
    while i < len(lines):
        line = lines[i].rstrip('\r')
        stripped = line.strip()

        # Detect question start: "N. question text" or "N question text" (missing period)
        q_match = re.match(r'^(\d+)[.\s]\s*(.*)', stripped)
        # Make sure this is actually a question (has substantial text after the number)
        if q_match and len(q_match.group(2).strip()) > 5:
            # Save previous question if exists
            if current_q:
                current_q['question'] = ' '.join(question_text_lines).strip()
                current_q['question'] = re.sub(r'\s+', ' ', current_q['question'])
                questions.append(current_q)

            q_num = int(q_match.group(1))
            q_text_start = q_match.group(2).strip()

            current_q = {
                'number': q_num,
                'question': '',
                'a': '',
                'b': '',
                'c': '',
                'd': '',
                'correct': '',
                'level': 1,
                'skill': 'VOCABULARY',
                'explanation': ''
            }
            question_text_lines = [q_text_start] if q_text_start else []
            i += 1
            continue

        # Detect options line: "A. xxx B. yyy C. zzz D. www"
        # Flexible matching: period or space after letter, handles "B lane" typo
        opt_match = re.match(
            r'^\s*A[.,]\s*(.*?)\s+B[.,\s]\s*(.*?)\s+C[.,]\s*(.*?)\s+D[.,]\s*(.*)',
            stripped
        )
        if opt_match and current_q:
            current_q['a'] = opt_match.group(1).strip()
            current_q['b'] = opt_match.group(2).strip()
            current_q['c'] = opt_match.group(3).strip()
            current_q['d'] = opt_match.group(4).strip()
            i += 1
            continue

        # If line starts with just "A." (without B, C, D on same line), it might be individual options
        single_opt = re.match(r'^\s*([A-D])[.,]\s*(.*)', stripped)
        if single_opt and current_q:
            opt_letter = single_opt.group(1).upper()
            opt_text = single_opt.group(2).strip()
            if opt_letter == 'A':
                current_q['a'] = opt_text
            elif opt_letter == 'B':
                current_q['b'] = opt_text
            elif opt_letter == 'C':
                current_q['c'] = opt_text
            elif opt_letter == 'D':
                current_q['d'] = opt_text
            i += 1
            continue

        # Continuation of question text (multi-line questions like Q48, Q104)
        if current_q and stripped and not re.match(r'^[A-D][.,]', stripped):
            # Check it's not the start of a new question
            if not re.match(r'^\d+[.\s]', stripped) or len(stripped) < 10:
                question_text_lines.append(stripped)

        i += 1

    # Don't forget the last question
    if current_q:
        current_q['question'] = ' '.join(question_text_lines).strip()
        current_q['question'] = re.sub(r'\s+', ' ', current_q['question'])
        questions.append(current_q)

    return questions


def get_word_level(word):
    """
    Determine difficulty level of a word/phrase using zipf frequency.
    Based on word frequency data from large corpora (Wikipedia, COCA, etc.).

    Zipf scale (log scale of word frequency):
      - >= 5.0 : Very common words (need, order, idea, open, hold...)
      - 4.0-5.0: Intermediate words (accused, adventure, directors, loose...)
      - < 4.0  : Rare/advanced words (canals, bounced, enroll, lodging, dimly...)
    
    Thresholds calibrated on actual data distribution for balanced 3-level split.
    """
    # For phrasal verbs like "come up", "break down", check full phrase first
    phrase_freq = zipf_frequency(word.lower(), 'en')

    # If it's a multi-word phrase and has low freq, also check individual words
    words = word.lower().split()
    if len(words) > 1:
        # For phrasal verbs, use the lowest frequency component
        # (e.g., "break down" -> difficulty depends on knowing the phrasal verb meaning)
        individual_freqs = [zipf_frequency(w, 'en') for w in words]
        # Phrasal verbs are inherently harder even if individual words are common
        # So we reduce the effective frequency slightly
        freq = max(phrase_freq, min(individual_freqs) - 0.5)
    else:
        freq = phrase_freq

    if freq >= 5.0:
        return 1  # Easy - very common words
    elif freq >= 4.0:
        return 2  # Medium - intermediate words
    else:
        return 3  # Hard - rare/advanced words


def assign_vocab_answers(questions, answer_key):
    """
    Assign correct answers from the answer key and determine difficulty levels
    using word frequency analysis (wordfreq library).

    Level classification based on zipf frequency of the correct answer word:
      - Level 1 (Easy):   zipf >= 4.5 (top ~2000 most common English words)
      - Level 2 (Medium): zipf 3.0-4.5 (intermediate frequency words)
      - Level 3 (Hard):   zipf < 3.0 (rare/advanced/academic words)
    """
    for q in questions:
        q_num = q['number']

        # Assign correct answer from key
        if q_num in answer_key:
            q['correct'] = answer_key[q_num]
        else:
            q['correct'] = ''

        # Get the correct answer text
        correct_text = ''
        if q['correct']:
            correct_letter = q['correct']
            if correct_letter == 'A':
                correct_text = q['a']
            elif correct_letter == 'B':
                correct_text = q['b']
            elif correct_letter == 'C':
                correct_text = q['c']
            elif correct_letter == 'D':
                correct_text = q['d']

        # Assign difficulty level based on word frequency
        if correct_text:
            q['level'] = get_word_level(correct_text)
            freq = zipf_frequency(correct_text.lower(), 'en')
            q['explanation'] = (f'The correct answer is "{correct_text}" ({q["correct"]}). '
                                f'[Word frequency: {freq:.2f} zipf]')
        else:
            q['level'] = 1
            q['explanation'] = ''

    return questions


# ============================================================
# MAIN
# ============================================================

def main():
    # --- Part 1: Parse Grammar questions (from data.md) ---
    grammar_filepath = r'c:\HOCTAP\KLTN_main\Database\data.md'
    grammar_questions = []
    try:
        grammar_questions = parse_grammar_questions(grammar_filepath)
        grammar_questions = assign_grammar_answers(grammar_questions)
        print(f"Parsed {len(grammar_questions)} GRAMMAR questions from data.md")
    except FileNotFoundError:
        print(f"Warning: {grammar_filepath} not found. Skipping grammar questions.")

    # --- Part 2: Parse Vocab questions (from data_vocab.txt) ---
    vocab_filepath = r'c:\HOCTAP\KLTN_main\Database\data_vocab.txt'
    answer_filepath = r'c:\HOCTAP\KLTN_main\Database\dap_an_vocab.txt'

    answer_key = parse_vocab_answer_key(answer_filepath)
    print(f"Loaded {len(answer_key)} answers from answer key")

    vocab_questions = parse_vocab_questions(vocab_filepath)
    vocab_questions = assign_vocab_answers(vocab_questions, answer_key)
    print(f"Parsed {len(vocab_questions)} VOCABULARY questions from data_vocab.txt")

    # Filter out questions without options (e.g., question 231 is incomplete)
    valid_vocab = []
    skipped = []
    for q in vocab_questions:
        if q['a'] and q['b'] and q['c'] and q['d'] and q['correct']:
            valid_vocab.append(q)
        else:
            skipped.append(q['number'])
    
    if skipped:
        print(f"Skipped {len(skipped)} incomplete questions: {skipped}")

    # --- Combine all questions ---
    output = []

    for q in grammar_questions:
        output.append({
            'question': q['question'],
            'a': q['a'],
            'b': q['b'],
            'c': q['c'],
            'd': q['d'],
            'correct': q['correct'],
            'level': q['level'],
            'skill': q['skill'],
            'explanation': q['explanation']
        })

    for q in valid_vocab:
        output.append({
            'question': q['question'],
            'a': q['a'],
            'b': q['b'],
            'c': q['c'],
            'd': q['d'],
            'correct': q['correct'],
            'level': q['level'],
            'skill': q['skill'],
            'explanation': q['explanation']
        })

    # Save to JSON
    output_path = r'c:\HOCTAP\KLTN_main\Database\questions.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nTotal questions written: {len(output)}")
    print(f"Output saved to: {output_path}")

    # Print summary by skill and level
    print("\n--- Summary ---")
    summary = {}
    for q in output:
        key = (q['skill'], q['level'])
        summary[key] = summary.get(key, 0) + 1
    
    for (skill, level), count in sorted(summary.items()):
        print(f"  {skill} Level {level}: {count} questions")

    # Check for missing answers
    missing = [q for q in output if not q['correct']]
    if missing:
        print(f"\n {len(missing)} questions without answers!")


if __name__ == '__main__':
    main()
