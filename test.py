import os
import random
import string
import threading
import time
import unittest

from selenium import webdriver

from example_python.main import app

# see: https://blog.miguelgrinberg.com/post/using-headless-chrome-with-selenium
# configuration
# https://www.kenst.com/2019/02/installing-chromedriver-on-windows/
os.environ['PATH'] += os.pathsep + r'C:\ProgramData\chocolatey\lib\chromedriver\tools'
port = 5066
host_name = f'http://localhost:{port}'


class SeleniumTest(unittest.TestCase):
    driver = None

    @classmethod
    def setUpClass(cls) -> None:
        options = webdriver.ChromeOptions()
        options.add_argument('headless')
        try:
            cls.driver = webdriver.Chrome(options=options)
        except Exception as e:
            print(f'ERROR: {e}')

        if cls.driver:
            # create client
            cls.app = app
            cls.app.testing = True
            cls.app_context = cls.app.app_context()
            cls.app_context.push()

            # start the Flask server in a thread
            threading.Thread(target=cls.app.run, kwargs=dict(port=port)).start()

            # give the server a second to ensure it is up
            time.sleep(3)

    @classmethod
    def tearDownClass(cls):
        if cls.driver:
            # stop the flask server and the browser
            cls.driver.get(f'{host_name}/shutdown')
            cls.driver.stop_client()
            cls.driver.quit()

            # destroy database
            # remove application context
            cls.app_context.pop()

    def setUp(self):
        if not self.driver:
            self.skipTest('Web browser not available')

    def tearDown(self):
        pass

    def set_text(self, item_id: str, text: str = '', parent=None):
        """
        clear and set the input element identified by the item_id

        :param item_id: id of item to set text or css selector
        :param text:
        :param parent: {Object} parent dom object
        """
        if not parent:
            parent = self.driver
        try:
            input_element = parent.find_element_by_id(item_id)
        except:
            input_element = parent.find_element_by_css_selector(item_id)

        input_element.clear()
        input_element.send_keys(text)

    def assertDisplayed(self, item: object):
        """
        assert that item is displayed.

        :param item: id or a selenium element.  if id is str tries to find by id
        """
        if type(item) == str:
            item = self.driver.find_element_by_id(item)
        self.assertTrue(item.is_displayed(), 'Item is not displayed')

    def assertHidden(self, item: object):
        """
        assert that item is hidden.

        :param item: id or a selenium element.  if id is str tries to find by id
        """
        if type(item) == str:
            item = self.driver.find_element_by_id(item)
        self.assertFalse(item.is_displayed(), 'Item is not hidden')

    @staticmethod
    def random_string(length: int = 20):
        return ''.join([random.choice(string.ascii_letters) for r in range(length)])

    def wait_for(condition_function):
        start_time = time.time()
        while time.time() < start_time + 3:
            if condition_function():
                return True
            else:
                time.sleep(0.1)
        raise Exception('Timeout waiting for {}'.format(condition_function.__name__))


class PageIndex(SeleniumTest):

    def load_page(self):
        start_time = time.time()
        self.driver.get(f'{host_name}/')
        while time.time() < start_time + 3:
            p = self.driver.find_element_by_id('loading_finished')
            if p.text == 'finished':
                return True
            else:
                time.sleep(0.1)
        raise Exception('Timeout waiting for page to load')

    def assertMessage(self, message):
        self.assertEqual(message, self.driver.find_element_by_id(f'message').text)

    def setUp(self):
        self.initial_list_count = 5

    def test_load(self):
        self.load_page()
        main_content = self.driver.find_element_by_id('view-content')
        self.assertTrue(main_content)

    def test_children_table(self):
        self.load_page()

        table = self.driver.find_element_by_id('children_table')
        self.assertTrue(table)
        table_list = table.find_elements_by_tag_name('tr')
        tr_count = len(table_list)
        self.assertEqual(6, tr_count)
        self.driver.find_element_by_id(f'add_child_button').click()
        self.assertEqual(len(table.find_elements_by_tag_name('tr')), tr_count + 1)
        # remove one
        buttons = table.find_elements_by_tag_name('button')
        buttons[0].click()
        self.assertEqual(len(table.find_elements_by_tag_name('tr')), tr_count)

    def test_other_children_table(self):
        self.load_page()

        table = self.driver.find_element_by_id('other_children_table')
        self.assertTrue(table)
        table_list = table.find_elements_by_tag_name('tr')
        tr_count = len(table_list)
        self.assertEqual(6, tr_count)
        self.driver.find_element_by_id(f'add_other_child_button').click()
        self.assertEqual(len(table.find_elements_by_tag_name('tr')), tr_count + 1)
        # remove one
        buttons = table.find_elements_by_tag_name('button')
        buttons[0].click()
        self.assertEqual(len(table.find_elements_by_tag_name('tr')), tr_count)

    def test_list_children_table(self):
        self.load_page()

        table = self.driver.find_element_by_id('list_children_table')
        self.assertTrue(table)
        tr_list = table.find_elements_by_css_selector('tbody tr')
        tr_count = len(tr_list)
        self.assertEqual(5, tr_count)
        self.driver.find_element_by_id(f'add_list_child_button').click()
        tr_list = table.find_elements_by_css_selector('tbody tr')
        self.assertEqual(len(tr_list), tr_count + 1)
        # remove one
        buttons = table.find_elements_by_tag_name('button')
        buttons[0].click()
        tr_list = table.find_elements_by_css_selector('tbody tr')
        self.assertEqual(len(tr_list), tr_count)
        new_value = self.random_string()
        td_name = tr_list[1].find_elements_by_tag_name('td')[2]
        name = td_name.text
        tr_list[1].find_elements_by_tag_name('input')[0].send_keys(new_value)
        self.assertEqual(name+new_value, td_name.text)


    def test_input(self):
        self.load_page()

        input_input = self.driver.find_element_by_id('input_input')
        v = self.random_string()
        self.set_text('input_input', v)
        input_input_p = self.driver.find_element_by_id('inputValue')
        self.assertEqual(v, input_input.get_attribute('value'))
        self.assertEqual(v, input_input_p.text)


class PageAbout(SeleniumTest):
    def test_get(self):
        self.driver.get(f'{host_name}/about')
        self.assertEqual(
            self.driver.title,
            'DeclareMVC Example and Testing application')


if __name__ == '__main__':
    unittest.main()
