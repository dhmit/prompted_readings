"""

Analysis.py - initial analyses for dhmit/rereading

"""
from ast import literal_eval
import csv
from pathlib import Path


def load_data_csv(csv_path: Path):
    """
    Takes the path to a csv file, reads it, and returns its
    content as a list of OrderedDicts
    :param Path csv_path: path to the CSV file
    :return: List[dict]
    """
    out_data = []
    with open(str(csv_path)) as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            row['views'] = literal_eval(row['views'])
            for header_name in ('id', 'student_id', 'scroll_ups'):
                row[header_name] = int(row[header_name])
            row = dict(row)
            out_data.append(row)
    return out_data


def detect_string_at_index(base_string, start_index, string_segment):
    if start_index > len(base_string):
        return False
    elif len(string_segment) == 0:
        return True
    if not start_index >= len(base_string):
        if base_string[start_index] == string_segment[0]:
            return detect_string_at_index(base_string, start_index + 1, string_segment[1:])
        elif base_string[start_index] != string_segment[0]:
            return False
    else:
        return False


def find(sub_string, main_string):
    index = 0
    found_indexes = []
    while index < len(main_string):
        sub_string_found = detect_string_at_index(main_string, index, sub_string)
        if sub_string_found:
          found_indexes.append(index)
        index+=1
    return found_indexes


def run_analysis():
    csv_path = Path('data', 'rereading_data_2019-09-13.csv')
    student_data = load_data_csv(csv_path)
    # TODO: do something with student_data that's not just printing it
def extract_one_word_response(student_data, context):
    one_word_response = []
    for dictionary in student_data:
        if (dictionary["context"] == context
                and dictionary["question"] == "In one word, how does this text make you feel?"):
            one_word_response.append(dictionary["response"])
            len_views = len(dictionary["views"])
            if len_views == 0:
                print('0')
            elif len_views in response_dictionary.keys():
                response_dictionary[len_views].append(dictionary["response"])
            else:
                response_dictionary.update({len_views: [dictionary["response"]]})
        if (dictionary["context"] == "This is actually a short story."
                and dictionary["question"] == "In one word, how does this text make you feel?"):
            story_response.append(dictionary["response"])
    one_word_response_sad_number = 0
    story_response_sad_number = 0
    for response in one_word_response:
        if len(find("sad",response.lower())) > 0:#response.lower() == "sad":
            one_word_response_sad_number += 1
    for response in story_response:
        if len(find("sad",response.lower())) > 0:
            story_response_sad_number += 1
    print(one_word_response)
    print(one_word_response_sad_number)
    print(story_response)
    print(story_response_sad_number)
    return one_word_response


def extract_one_word_views(student_data, context):
    views = []
    for dictionary in student_data:
        if (dictionary["context"] == context
                and dictionary["question"] == "In one word, how does this text make you feel?"):
            views.append(len(dictionary["views"]))
    return views


def count_sad(responses):
    count = 1
    for r in responses:
        if r.lower() == "sad":
            count += 1
    return count


def run_analysis():
    csv_path = Path('data', 'rereading_data_2019-09-13.csv')
    student_data = load_data_csv(csv_path)

    one_word_response_ad = extract_one_word_response(student_data, "This is an ad.")
    one_word_response_story = extract_one_word_response(student_data, "This is actually a short story.")
    count_sad_ad = count_sad(one_word_response_ad)
    count_sad_story = count_sad(one_word_response_story)
    print("Given the context of an ad, the number of one-word responses to the story that say 'sad' is", count_sad_ad)
    print("In comparison, given the context of a story, the number is", count_sad_story)
    print()

    one_word_views_ad = extract_one_word_views(student_data, "This is an ad.")
    one_word_views_story = extract_one_word_views(student_data, "This is actually a short story.")
    print("Given the context of an ad, the average number of views taken to give a one-word response is",
          '{0:.3g}'.format(sum(one_word_views_ad) / len(one_word_views_ad)))
    print("In comparison, given the context of a story, the average number is",
          '{0:.3g}'.format(sum(one_word_views_story) / len(one_word_views_story)))

    # print(student_data)


if __name__ == '__main__':
    run_analysis()
