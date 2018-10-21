// @flow
/* eslint eqeqeq: "off" */

import * as React from 'react';
import { Component } from 'react-simplified';
import { HashRouter, Route, NavLink } from 'react-router-dom';
import ReactDOM from 'react-dom';

class Student {
  firstName: string;
  lastName: string;
  email: string;

  constructor(firstName: string, lastName: string, email: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }
}

class Course {
  code: number;
  title: string;
  enrolled: Student[];

  constructor(code: number, title: string, enrolled: Student[]) {
    this.code = code;
    this.title = title;
    this.enrolled = enrolled;
  }
}

let students = [
  new Student('Ola', 'Jensen', 'ola.jensen@ntnu.no'),
  new Student('Kari', 'Larsen', 'kari.larsen@ntnu.no'),
  new Student('Seb', 'Cool', 'seb.isCool@ntnu.no'),
  new Student('Matt', 'Cap', 'Matt.hasCap@ntnu.no')
];

let courses = [new Course(1001, 'Memeology', students), new Course(1002, 'Random', students.slice(2, 4))];

class Home extends Component {
  render() {
    return <Card title="Home">User input and application state are covered next week.</Card>;
  }
}

class Menu extends Component {
  render() {
    return (
      <nav class="navbar navbar-light bg-light justify-content-between">
        <a class="navbar-brand">Navbar</a>
        <form class="form-inline">
          <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
            {' '}
          </input>
          <button class="btn btn-outline-success my-2 my-sm-0" type="submit">
            Search
          </button>
        </form>
      </nav>
    );
  }
}

class CourseList extends Component {
  render() {
    return (
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Courses</h5>
          <ul class="list-group">
            {courses.map(course => (
              <li key={course.code} class="list-group-item">
                <NavLink activeStyle={{ color: 'darkblue' }} to={'/courses/' + course.code}>
                  {course.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

class CourseDetails extends Component<{ match: { params: { code: number } } }> {
  render() {
    let course = courses.find(course => course.code == this.props.match.params.code);
    if (!course) {
      console.error('Course not found'); // Until we have a warning/error system (next week)
      return null; // Return empty object (nothing to render)
    }
    return (
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Details</h5>
          <ul class="list-group">
            <li class="list-group-item">Code: {course.code}</li>
            <li class="list-group-item">Title: {course.title}</li>
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Students</h5>
                <li class="list-group">
                  {course.enrolled.map(student => (
                    <li key={student.email} class="list-group-item">
                      {student.firstName} {student.lastName}
                    </li>
                  ))}
                </li>
              </div>
            </div>
          </ul>
        </div>
      </div>
    );
  }
}

class StudentList extends Component {
  render() {
    return (
      <ul>
        {students.map(student => (
          <li key={student.email}>
            <NavLink activeStyle={{ color: 'darkblue' }} to={'/students/' + student.email}>
              {student.firstName} {student.lastName}
            </NavLink>
          </li>
        ))}
      </ul>
    );
  }
}

class StudentDetails extends Component<{ match: { params: { email: string } } }> {
  render() {
    let student = students.find(student => student.email == this.props.match.params.email);
    if (!student) {
      console.error('Student not found'); // Until we have a warning/error system (next week)
      return null; // Return empty object (nothing to render)
    }
    return (
      <div>
        <ul>
          <li>First name: {student.firstName}</li>
          <li>Last name: {student.lastName}</li>
          <li>Email: {student.email}</li>
        </ul>
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Courses</h5>
            <ul class="list-group">
              {courses
                .filter(course => course.enrolled.filter(enrolled => enrolled.email == student.email).length > 0)
                .map(course => (
                  <li class="list-group-item">{course.title}</li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

const root = document.getElementById('root');
if (root)
  ReactDOM.render(
    <HashRouter>
      <div>
        <Menu />
        <div>
          <Route path="/" component={Home} />
          <Route path="/students" component={StudentList} />
          <Route path="/courses" component={CourseList} />
          <div>
            <Route path="/students/:email" component={StudentDetails} />
            <Route path="/courses/:code" component={CourseDetails} />
          </div>
        </div>
      </div>
    </HashRouter>,
    root
  );
