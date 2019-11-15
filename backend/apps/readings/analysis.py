"""

Analysis.py - analyses for dhmit/rereading wired into the webapp

"""

from .models import StudentReadingData


class RereadingAnalysis:
    """
    This class loads all StudentReadingData objects from the db,
    and implements analysis methods on these responses.
    """

    def __init__(self):
        """ On initialization, we load all of the StudentResponses from the db """
        self.responses = StudentResponsePrototype.objects.all()

    def total_view_time(self):
        """
        Queries the db for all StudentResponses,
        and computes total time (across all users) spent reading the text

        :return: float, the total time all users spent reading the text
        """

        total_view_time = 0
        for response in self.responses:
            for view_time in response.get_parsed_views():
                total_view_time += view_time
        return round(total_view_time)

    def all_responses(self):
        """
        Given a list of student response dicts, returns the most common responses for each
        question and in each context.
        :return: list of dictionaries storing each question, context, and most common answers
        """
        questions = []
        contexts = []
        all_responses = []
        for response in self.responses:
            if response.question.text not in questions:
                questions.append(response.question.text)
            if response.context.text not in contexts:
                contexts.append(response.context.text)
        for question in questions:
            for context in contexts:
                answers = most_common_response_by_question_and_context(
                    self.responses,
                    question,
                    context,
                )
                response_by_question_and_context = {
                    'question': question,
                    'context': context,
                    'answers': answers
                }
                all_responses.append(response_by_question_and_context)

        return all_responses

    def frequency_feelings(self):
        """
        Compute the frequencies of all the responses. Not sensitive to case.
        :return a list of tuples of words that appear more than once, and how often they occur,
        in order of their frequency
        """
        feelings = {}
        for response in self.responses:
            if response.question.text == "In one word, how does this text make you feel?":
                lower_case_word = response.response.lower()
                if feelings.get(lower_case_word, 0) == 0:
                    feelings[lower_case_word] = 1
                else:
                    feelings[lower_case_word] += 1

        frequent_words = []  # list of tuples in the format (frequency, word)
        for word in feelings:
            if feelings[word] > 1:
                frequent_words.append((word, feelings[word]))
        frequent_words.sort(key=lambda x: x[1], reverse=True)
        return frequent_words

    def context_vs_read_time(self):
        """
        Compares mean view times of all contexts
        :return a dictionary where the context is the key and the mean view time for that context
        is the value
        """
        all_contexts = ContextPrototype.objects.all()
        total_contexts_view_times = {context.text: {
            "total_view_time": 0,
            "count": 0
        }
                                     for context in all_contexts}

        for response in self.responses:
            context = response.context.text
            total_contexts_view_times[context]["total_view_time"] += \
                sum(response.get_parsed_views())
            total_contexts_view_times[context]["count"] += 1

        # For each context in total_contexts_view_time, calculate the average view time
        average_context_view_times = {context:
                                      total_contexts_view_times[context]["total_view_time"] /
                                      total_contexts_view_times[context]["count"]
                                      for context in total_contexts_view_times}
        return average_context_view_times

    def question_sentiment_analysis(self):
        """
        Uses database to create a list of sentiment scores for
        :return:
        """
        sentiments = get_sentiments()
        student_data = self.responses
        question_text = 'In one word'

        # Set up data for calculations
        num_scores = 0
        sentiment_sum = 0
        score_list = list()

        for response in student_data:

            if question_text in response.question.text:
                words = response.response.lower().split()

                # Find the sentiment score for each word, and add it to our data
                for word in words:
                    # Ignore the word if it's not in the sentiment dictionary
                    if word in sentiments:
                        sentiment_sum += sentiments[word]
                        num_scores += 1
                        score_list.append(sentiments[word])

        average = sentiment_sum / num_scores
        standard_dev = statistics.stdev(score_list)

        return average, standard_dev

    @property
    def run_mean_reading_analysis_for_questions(self):
        """
        Runs the analysis on the data loaded from the CSV file by looking at the average
        read time for each question and the context that the question was given in and
        prints it in a nice readable format.
        :return: the info wed like to put on js
        """

        questions = []
        contexts = []
        student_data = self.responses[:]
        for response in student_data:
            if response.question.text not in questions:
                questions.append(response.question.text)
            if response.context.text not in contexts:
                contexts.append(response.context.text)

        mean_reading_time_results_data = []

        for question in questions:
            for context in contexts:
                mean_reading_time_results_data.append(self.mean_reading_time_for_a_question(
                    question, context))

        return mean_reading_time_results_data

    def mean_reading_time_for_a_question(self, question, context):
        """
        Given the student response dicts, computes the mean read time for a
        specific question (given by its keyword) and the context in which it was asked.
        Returns the question, context, mean read time, and number of people who read.
        :param question: string, to determine which question was being asked
        :param context: string, what the reader thought the reading was
        :return: tuple, in order of the question asked (full question), the context,
        the mean read time, and the number of people who read it
        """
        mean_time = 0
        number_of_readers = 0
        question_count = 0
        reading_time = []
        total_question_view_time = 0
        student_data = self.responses[:]
        for response in student_data:
            if question != response.question.text or context != response.context.text:
                continue
            if response.get_parsed_views():
                number_of_readers += 1
            for view_time in response.get_parsed_views():
                reading_time.append(view_time)

        if reading_time:
            reading_time = remove_outliers(reading_time)

        view_time = 0
        while view_time < len(reading_time):
            question_count += 1
            total_question_view_time += reading_time[view_time]
            view_time += 1

        if reading_time:
            mean_time = round(total_question_view_time / len(reading_time), 2)

        return [question, context, mean_time, number_of_readers]

    def compute_median_view_time(self):
        """
        Given a list of student response dicts,
        return the median time (across all users) spent reading the text
        :return: float, median amount of time users spend reading the text
        """
        list_of_times = []
        for row in self.responses:
            for view_time in row.get_parsed_views():
                list_of_times.append(view_time)
        if not list_of_times:
            median_view_time = 0
        else:
            list_of_times.sort()
            median_view_time = statistics.median(list_of_times)
        return median_view_time

    def compute_reread_counts(self, question, context):
        """"
        Given a list of student response dicts,
        return a dictionary containing the number of times students had to reread the text
        :param question: string, question for which reread counts is collected
        :param context: string, context for which reread counts is collected
        :return: tuple, which contains the question, context, and number of students that reread
         the text 0 times, 1 time, etc.
        """

        # Checks that the question and context are not blank
        if question == '' or context == '':
            return {}

        # Collects the reread counts for every student id of the provided context and question
        raw_reread_counts = []
        for response in self.responses:
            table_context = response.context.text
            table_question = response.question.text
            view_count = len(response.get_parsed_views())
            if context in table_context:
                if question in table_question:
                    raw_reread_counts.append(view_count)

        remove_outliers(raw_reread_counts)

        # Tallies the raw reread counts into the dictionary to be returned
        organized_data = {}
        for entry in raw_reread_counts:
            if entry in organized_data.keys():
                organized_data[entry] += 1
            else:
                organized_data.update({entry: 1})

        # Makes the organized_data dictionary keys uniform
        for key in range(0, max(organized_data.keys()) + 1):
            if key not in organized_data.keys():
                organized_data.update({key: 0})

        return [question, context] + list(organized_data.values())

    @property
    def get_reread_counts(self):
        """
        Iterates through all of the question/context pairings and returns an array of
        tuples, which contains a question, context, and reread count values taken from
        the compute_reread_counts function.
        :return: Array of tuples, each tuple generated by running the compute_reread_counts
        function for a different question/context pairing.
        """
        results = []
        for context in self.responses.context.text:
            for question in self.responses.question.text:
                results.append(self.compute_reread_counts(question, context))

        # Making array sizes uniform
        max_len = 0
        for array in results:
            if len(array) > max_len:
                max_len = len(array)
        for array in results:
            if len(array) < max_len:
                while len(array) < max_len:
                    array.append(0)

        return results

    def compute_mean_response_length(self):
        """
        Given a list of student response dicts,
        return the mean character length (across all users) of the response
        :return: float, mean number of characters in the user's response
        """
        mean_response_length = 0
        for row in self.responses:
            mean_response_length += len(row.response)
        return round(mean_response_length / len(self.responses), 2)

    def get_number_of_unique_students(self):
        """
        Count the number of unique students that gave responses
        :return: the number of unique students that gave responses
        """
        unique_students = set()
        for row in self.responses:
            unique_students.add(row.student)
        return len(unique_students)

    @staticmethod
    def description_has_relevant_words(story_meaning_description, relevant_words):
        """
        Determine if the user's description contains a word relevant to the story's meaning
        :param story_meaning_description: The user's three word description of the story
        :param relevant_words: a list of words which show an understanding of the story's meaning
        :return True if the description contains one of the relevant words or relevant_words is
        empty. False otherwise
        """
        if not relevant_words:
            return True

        lowercase_relevant_words = []
        for word in relevant_words:
            lowercase_relevant_words.append(word.lower())

        words_used_in_description = story_meaning_description.lower().split(" ")

        for word in lowercase_relevant_words:
            if word.lower() in words_used_in_description:
                return True
        return False

    @staticmethod
    def transform_nested_dict_to_list(nested_dict):
        """
        Transforms a nested dictionary data structure into a flat array of tuples in the form
        (key1, key2, value).
        :param nested_dict: the map generated by
        students_using_relevant_words_by_context_and_question
        :return a list of tuples in the form (context, question, data)
        """
        flattened_list = []
        for key1, inner_keys in nested_dict.items():
            for key2, value in inner_keys.items():
                flattened_list.append((key1, key2, value))
        return flattened_list

    def students_using_relevant_words_by_context_and_question(self):
        """
        Return a list of tuples of the form (question, context, count), where count is
        the number of students who used relevant words in that context and question. This list
        is sorted by question first and then context.
        :return the return type explained in the function description
        """
        relevant_words = ["dead", "death", "miscarriage", "killed", "kill", "losing", "loss",
                          "lost", "deceased", "died", "grief", "pregnancy", "pregnant"]

        question_context_count_map = {}

        for row in self.responses:
            question = row.question.text
            context = row.context.text
            if question not in question_context_count_map:
                question_context_count_map[question] = {}
            if context not in question_context_count_map[question]:
                question_context_count_map[question][context] = 0

            if RereadingAnalysis.description_has_relevant_words(row.response, relevant_words):
                question_context_count_map[question][context] += 1

        flattened_data = RereadingAnalysis.transform_nested_dict_to_list(question_context_count_map)
        flattened_data.sort()
        return flattened_data

    def percent_using_relevant_words_by_context_and_question(self):
        """
        Return a list of tuples of the form (question, context, percent), where percent is
        the percentage [0.00, 1.00] of students who used relevant words in that context and
        question. This list is sorted by question first and then context.
        :return: The return type explained in the function description.
        """
        total_student_count = self.get_number_of_unique_students()

        question_context_count_list = self.students_using_relevant_words_by_context_and_question()
        self.readings = StudentReadingData.objects.all()
